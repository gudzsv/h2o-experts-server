import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

import {
  RANDOM_BYTES,
  THIRTY_DAYS,
  ONE_DAY,
  SALT,
  JWT,
  ENV_VARS,
  EMAIL_TEMPLATE,
} from '../constants/index.js';

import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';
import { sendEmail } from '../utils/sendEmail.js';

import { UserCollection } from '../db/models/users.js';
import { SessionCollection } from '../db/models/sessions.js';

export const countUsers = async () => {
  return UserCollection.countDocuments();
};

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });

  if (user) throw createHttpError.Conflict('Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, SALT);

  return await UserCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

const createSession = () => {
  const accessToken = randomBytes(RANDOM_BYTES).toString('base64');
  const refreshToken = randomBytes(RANDOM_BYTES).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + ONE_DAY),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError.NotFound('User not found.');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError.Unauthorized('Unauthorized user.');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError.Unauthorized('Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError.Unauthorized('Session token expired');
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const getUserById = async (userId) => {
  const user = await UserCollection.findById(userId);
  return user;
};

export const updateUser = async (userId, payload) => {
  const rawResult = await UserCollection.findByIdAndUpdate(userId, payload, {
    new: true,
    includeResultMetadata: true,
  });

  if (!rawResult || !rawResult.value) return null;

  return {
    user: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted),
  };
};

export const sendResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });

  if (!user) {
    throw createHttpError.NotFound('User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env(ENV_VARS.JWT_SECRET),
    {
      expiresIn: JWT.EXPIRE_IN,
    },
  );

  const resetPasswordTemplatePath = path.join(
    EMAIL_TEMPLATE.TEMPLATES_DIR,
    EMAIL_TEMPLATE.TEMPLATE_FILE_NAME,
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env(ENV_VARS.APP_DOMAIN)}/reset-password?token=${resetToken}`,
  });
  try {
    await sendEmail({
      from: env(ENV_VARS.BREVO.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError.InternalServerError(
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, env(ENV_VARS.JWT_SECRET));
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError.Unauthorized('Token is expired or invalid.');
    throw err;
  }

  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError.NotFound('User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, SALT);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
  await SessionCollection.deleteOne({ userId: user._id });
};

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();

  if (!payload) throw createHttpError.Unauthorized('Unauthorized user');

  let user = await UserCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(RANDOM_BYTES), SALT);
    user = await UserCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
    });
  }

  const newSession = createSession();

  return await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { HTTP_STATUSES, TOKEN_PARAMS, SALT } from '../constants/index.js';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from '../utils/googleOAuth2.js';
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
  const accessToken = TOKEN_PARAMS.accessToken;
  const refreshToken = TOKEN_PARAMS.refreshToken;

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: TOKEN_PARAMS.accessTokenValidUntil,
    refreshTokenValidUntil: TOKEN_PARAMS.refreshTokenValidUntil,
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

// Gooogle OAuth2

export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();
  if (!payload) throw createHttpError(401);

  let user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(randomBytes(10), 10);
    user = await UsersCollection.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
    });
  }

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

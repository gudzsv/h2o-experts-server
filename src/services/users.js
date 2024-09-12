import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import createHttpError from 'http-errors';
// import jwt from 'jsonwebtoken';
// import handlebars from 'handlebars';
// import path from 'node:path';
// import fs from 'node:fs/promises';

// import { env } from '../utils/env.js';

import { HTTP_STATUSES, TOKEN_PARAMS } from '../constants/index.js';

import { UserCollection } from '../db/models/users.js';
import { SessionCollection } from '../db/models/sessions.js';

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });

  if (user) throw createHttpError(HTTP_STATUSES.CONFLICT, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

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
    throw createError(HTTP_STATUSES.NOT_FOUND, 'User not found.');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createError(HTTP_STATUSES.UNAUTHORIZED, 'Unauthorized user.');
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
    throw createError(HTTP_STATUSES.UNAUTHORIZED, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createError(HTTP_STATUSES.UNAUTHORIZED, 'Session token expired');
  }

  const newSession = createSession();

  await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

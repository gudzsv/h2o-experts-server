import createHttpError from 'http-errors';
import {
  countUsers,
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  getUserById,
  updateUser,
  sendResetToken,
  resetPassword,
  loginOrSignupWithGoogle,
} from '../services/users.js';

import { COOKIES, HTTP_STATUSES, THIRTY_DAYS } from '../constants/index.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';

export const countUsersController = async (req, res) => {
  const usersCount = await countUsers();

  res.status(HTTP_STATUSES.OK).json({
    status: HTTP_STATUSES.OK,
    message: 'Successfully found count users!',
    data: {
      usersCount,
    },
  });
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(HTTP_STATUSES.CREATED).json({
    status: HTTP_STATUSES.CREATED,
    message: 'Successfully registered a user!',
    data: user,
  });
};

const setupSession = (res, session) => {
  res.cookie(COOKIES.REFRESH_TOKEN, session.refreshToken, {
    httpOnly: true,
    maxAge: THIRTY_DAYS,
    expire: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie(COOKIES.SESSION_ID, session._id, {
    httpOnly: true,
    maxAge: THIRTY_DAYS,
    expire: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: HTTP_STATUSES.OK,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie(COOKIES.SESSION_ID);
  res.clearCookie(COOKIES.REFRESH_TOKEN);

  res.status(HTTP_STATUSES.NO_CONTENT).send();
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: HTTP_STATUSES.OK,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const getUserByIdController = async (req, res, next) => {
  const userId = req.user._id;
  const user = await getUserById(userId);

  if (!user) {
    next(createHttpError.NotFound('Contact not found'));
  }

  res.status(HTTP_STATUSES.OK).json({
    status: HTTP_STATUSES.OK,
    message: `Successfully found contact with id ${userId}!`,
    data: user,
  });
};

export const patchUserController = async (req, res, next) => {
  const userId = req.user._id;
  const photo = req.file;
  let photoUrl;

  if (photo) {
    photoUrl = await saveFileToCloudinary(photo);
  }

  const result = await updateUser(userId, {
    ...req.body,
    photo: photoUrl,
  });

  if (!result) {
    next(createHttpError.NotFound('User not found'));
    return;
  }

  res.json({
    status: HTTP_STATUSES.OK,
    message: 'Successfully patched a user!',
    data: result.user,
  });
};

export const sendResetEmailController = async (req, res) => {
  await sendResetToken(req.body.email);

  res.json({
    status: HTTP_STATUSES.OK,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);

  res.json({
    status: HTTP_STATUSES.OK,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();

  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

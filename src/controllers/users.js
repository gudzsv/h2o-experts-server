import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
} from '../services/users.js';

import { TOKEN_PARAMS, COOKIES, HTTP_STATUSES } from '../constants/index.js';

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
    expires: TOKEN_PARAMS.refreshTokenValidUntil,
  });
  res.cookie(COOKIES.SESSION_ID, session._id, {
    httpOnly: true,
    expires: TOKEN_PARAMS.accessTokenValidUntil,
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

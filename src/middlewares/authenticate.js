import createHttpError from 'http-errors';
import { HTTP_STATUSES } from '../constants/index.js';
import { SessionCollection } from '../db/models/sessions.js';
import { UserCollection } from '../db/models/users.js';

const { UNAUTHORIZED } = HTTP_STATUSES;

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return next(
      createHttpError(UNAUTHORIZED, 'Authorization header not found'),
    );
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(
      createHttpError(UNAUTHORIZED, 'Auth header should be of type Bearer'),
    );
  }

  try {
    const session = await SessionCollection.findOne({ accessToken: token });

    if (!session) {
      return next(createHttpError(UNAUTHORIZED, 'Session not found'));
    }

    const isAccessTokenExpired =
      new Date() > new Date(session.accessTokenValidUntil);

    if (isAccessTokenExpired) {
      return next(createHttpError(UNAUTHORIZED, 'Access token expired'));
    }

    const user = await UserCollection.findById(session.userId);

    if (!user) {
      return next(createHttpError(UNAUTHORIZED, 'User not found'));
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

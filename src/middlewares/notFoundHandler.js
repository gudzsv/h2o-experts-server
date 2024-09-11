import createHttpError from 'http-errors';
import { HTTP_STATUSES } from '../constants/index.js';

export const notFoundHandler = (req, res, next) => {
  const ERROR = createHttpError(HTTP_STATUSES.NOT_FOUND, 'Route not found');
  const ERROR_STATUS = ERROR.status;
  const ERROR_MESSAGE = ERROR.message;

  res.status(ERROR_STATUS).json({
    status: ERROR_STATUS,
    message: ERROR_MESSAGE,
  });
};

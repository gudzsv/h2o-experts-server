import { isHttpError } from 'http-errors';
import { HTTP_STATUSES } from '../constants/index.js';
import { MongooseError } from 'mongoose';

const { INTERNAL_SERVER_ERROR, BAD_REQUEST } = HTTP_STATUSES;

export const errorHandler = (error, req, res, next) => {
  let ERROR_STATUS;

  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(BAD_REQUEST).json({
      status: BAD_REQUEST,
      message: 'Invalid JSON format',
      data: {
        message: error.body.replace(/["\r\n\s\\]+/g, ''),
      },
    });
  }

  if (isHttpError(error)) {
    ERROR_STATUS = error.status;
    res.status(ERROR_STATUS).json({
      status: ERROR_STATUS,
      message: error.name,
      data: { ...error },
    });
    return;
  }

  ERROR_STATUS = INTERNAL_SERVER_ERROR;

  if (error instanceof MongooseError) {
    res.status(ERROR_STATUS).json({
      status: ERROR_STATUS,
      message: 'Mongoose error',
      data: { message: error.message },
    });
  }

  res.status(ERROR_STATUS).json({
    status: ERROR_STATUS,
    message: 'Something went wrong',
    data: { message: error.message },
  });
};

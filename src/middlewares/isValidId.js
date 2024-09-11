import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { HTTP_STATUSES } from '../constants/index.js';

export const isValidId =
  (idName = 'id') =>
  (req, res, next) => {
    const id = req.params[idName];


    if (!id) throw new Error('id is not provided in isValidId');

    if (!isValidObjectId(id))
      return next(
        createHttpError(
          HTTP_STATUSES.NOT_FOUND,
          `Invalid ID: '${id}' provided. Expected a valid 24-character MongoDB ObjectId.`,
        ),
      );

    return next();
  };

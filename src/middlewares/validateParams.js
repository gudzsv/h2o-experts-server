import createHttpError from 'http-errors';
import { HTTP_STATUSES } from '../constants/index.js';

export const validateParams = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.params, { abortEarly: false });

    next();
  } catch (error) {
    const errorMessages = error.details
      .map((detail) => detail.message.replace(/"/g, ''))
      .join('; ');

    const httpError = createHttpError(
      HTTP_STATUSES.BAD_REQUEST,
      'Bad request, url parameters are incorrect',
      {
        errors: errorMessages,
      },
    );

    next(httpError);
  }
};

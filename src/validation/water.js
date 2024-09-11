import Joi from 'joi';
import { JOI_VALIDATION_MSG, VALIDATION_LENGTH } from '../constants/index.js';
const { MIN_LENGTH, MAX_LENGTH } = VALIDATION_LENGTH;
const { MIN, MAX, STRING, EMAIL, REQUIRED } = JOI_VALIDATION_MSG;

export const registerUserSchema = Joi.object({
  name: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).default('User').messages({
    'string.base': STRING,
    'string.min': MIN,
    'string.max': MAX,
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': STRING,
      'string.email': EMAIL,
    }),
  password: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required().messages({
    'string.base': STRING,
    'string.min': MIN,
    'string.max': MAX,
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': STRING,
      'string.email': EMAIL,
    }),
  password: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required().messages({
    'string.min': MIN,
    'string.max': MAX,
  }),
});

export const sendResetEmailSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.base': STRING,
      'string.email': EMAIL,
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.base': STRING,
    'any.required': REQUIRED,
  }),
  password: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required().messages({
    'string.base': STRING,
    'string.min': MIN,
    'string.max': MAX,
    'any.required': REQUIRED,
  }),
});

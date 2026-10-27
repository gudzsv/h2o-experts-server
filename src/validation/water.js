import Joi from 'joi';
import { JOI_VALIDATION_MSG } from '../constants/index.js';
import { DRINK_TYPES } from '../utils/drinks.js';
const { REQUIRED, NUMBER, STRING, TIME, DATE, MONTH, ONE_OF } =
  JOI_VALIDATION_MSG;

const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

export const addWaterSchema = Joi.object({
  usedWater: Joi.number().required().messages({
    'number.base': NUMBER,
    'any.required': REQUIRED,
  }),

  drinkingTime: Joi.string().pattern(isoDateTimeRegex).required().messages({
    'string.base': STRING,
    'string.pattern.base': TIME,
    'any.required': REQUIRED,
  }),

  drinkType: Joi.string()
    .valid(...DRINK_TYPES)
    .messages({
      'string.base': STRING,
      'any.only': ONE_OF,
    }),
});

export const updateWaterSchema = Joi.object({
  usedWater: Joi.number().messages({
    'number.base': NUMBER,
  }),

  drinkingTime: Joi.string().pattern(isoDateTimeRegex).messages({
    'string.base': STRING,
    'string.pattern.base': TIME,
  }),

  drinkType: Joi.string()
    .valid(...DRINK_TYPES)
    .messages({
      'string.base': STRING,
      'any.only': ONE_OF,
    }),
});

export const dateSchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': DATE,
      'any.required': REQUIRED,
    }),
});

export const statsSchema = Joi.object({
  today: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const date = new Date(`${value}T00:00:00Z`);
      const isRealDate =
        !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);

      return isRealDate ? value : helpers.error('string.pattern.base');
    })
    .required()
    .messages({
      'string.pattern.base': DATE,
      'any.required': REQUIRED,
    }),
});

export const monthSchema = Joi.object({
  yearMonth: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': MONTH,
      'any.required': REQUIRED,
    }),
});

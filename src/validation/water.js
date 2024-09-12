import Joi from 'joi';
import { JOI_VALIDATION_MSG } from '../constants/index.js';
const { REQUIRED, NUMBER, STRING, TIME, DATE, MONTH } = JOI_VALIDATION_MSG;

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
});

export const updateWaterSchema = Joi.object({
  usedWater: Joi.number().messages({
    'number.base': NUMBER,
  }),

  drinkingTime: Joi.string().pattern(isoDateTimeRegex).messages({
    'string.base': STRING,
    'string.pattern.base': TIME,
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

export const monthSchema = Joi.object({
  yearMonth: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': MONTH,
      'any.required': REQUIRED,
    }),
});

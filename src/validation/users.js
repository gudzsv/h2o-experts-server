import Joi from 'joi';

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  weight: Joi.number(),
  activityLevel: Joi.number(),
  gender: Joi.string().valid('male', 'female'),
  dailyRequirement: Joi.number().integer(),
});

export const sendResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});

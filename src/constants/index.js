import { randomBytes } from 'crypto';
import path from 'path';

export const ENV_VARS = {
  MONGO: {
    MONGODB_USER: 'MONGODB_USER',
    MONGODB_PASSWORD: 'MONGODB_PASSWORD',
    MONGODB_URL: 'MONGODB_URL',
    MONGODB_DB: 'MONGODB_DB',
  },

  BREVO: {
    SMTP_HOST: 'SMTP_HOST',
    SMTP_PORT: 'SMTP_PORT',
    SMTP_USER: 'SMTP_USER',
    SMTP_PASSWORD: 'SMTP_PASSWORD',
    SMTP_FROM: 'SMTP_FROM',
  },

  CLOUDINARY: {
    CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME',
    API_KEY: 'CLOUDINARY_API_KEY',
    API_SECRET: 'CLOUDINARY_API_SECRET',
  },

  GOOGLE: {
    AUTH_CLIENT_ID: 'GOOGLE_AUTH_CLIENT_ID',
    AUTH_CLIENT_SECRET: 'GOOGLE_AUTH_CLIENT_SECRET',
  },

  JWT_SECRET: 'JWT_SECRET',

  APP_DOMAIN: 'APP_DOMAIN',
  APP_PORT: 'APP_PORT',
};

export const PATH_GOOGLE_JSON = path.join(process.cwd(), 'google-oauth.json');

export const HTTP_STATUSES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export const JOI_VALIDATION_MSG = {
  MIN: `'{{#label}}' must be at least '{{#limit}}'. You provided: '{{#value}}'`,
  MAX: `'{{#label}}' must be less than or equal to '{{#limit}}'. You provided: '{{#value}}'`,
  ONE_OF: `'{{#label}}' must be one of the following values: '{{#valids}}'. You provided: '{{#value}}'`,
  REQUIRED: `'{{#label}}' is a required field`,
  STRING: `'{{#label}} must be a string. You provided: '{{#value}}'`,
  NUMBER: `'{{#label}}' must be a number. You provided: '{{#value}}'`,
  INTEGER: `'{{#label}}' must be an integer. You provided: '{{#value}}'`,
  BOOLEAN: `'{{#label}}' must be a boolean value. You provided: '{{#value}}'`,
  PHONE_NUMBER: `'{{#label}}' must be a valid phone number. You provided: '{{#value}}'`,
  EMAIL: `'{{#label}}' must be a valid email address. You provided: '{{#value}}'`,
  TIME: `'{{#label}}' must be in the format YYYY-MM-DDTHH:mm:ss. You provided: '{{#value}}'`,
  DATE: `'{{#label}}' format must be YYYY-MM-DD. You provided: '{{#value}}'`,
  MONTH: `'{{#label}}' format must be YYYY-MM. You provided: '{{#value}}'`,
};

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const EMAIL_TEMPLATE = {
  TEMPLATES_DIR: path.join(process.cwd(), 'src', 'templates'),
  TEMPLATE_FILE_NAME: 'reset-password-email.html',
};
export const RANDOM_BYTES = 30;

export const SALT = 10;

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const THIRTY_DAYS = 30 * ONE_DAY;

export const TOKEN_PARAMS = {
  accessToken: randomBytes(RANDOM_BYTES).toString('base64'),
  refreshToken: randomBytes(RANDOM_BYTES).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
  refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
};

export const COOKIES = {
  SESSION_ID: 'sessionId',
  REFRESH_TOKEN: 'refreshToken',
};

export const JWT = {
  EXPIRE_IN: '15m',
};

export const VALIDATION_LENGTH = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
};

export const EMAIL_VALIDATION_LENGTH = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
};

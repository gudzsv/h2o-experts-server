import bcrypt from 'bcrypt';
import { env } from './env.js';
import { ENV_VARS } from '../constants/index.js';

export const getEncryptedPassword = async (password) =>
  await bcrypt.hash(password, Number(env(ENV_VARS.SALT)));

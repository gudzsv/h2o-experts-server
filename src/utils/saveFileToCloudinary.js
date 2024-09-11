import cloudinary from 'cloudinary';
import { env } from './env.js';
import { ENV_VARS } from '../constants/index.js';
import fs from 'node:fs/promises';

const { CLOUD_NAME, API_KEY, API_SECRET } = ENV_VARS.CLOUDINARY;
cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUD_NAME),
  api_key: env(API_KEY),
  api_secret: env(API_SECRET),
});

export const saveFileToCloudinary = async (file) => {
  const response = await cloudinary.v2.uploader.upload(file.path);
  await fs.unlink(file.path);
  return response.secure_url;
};

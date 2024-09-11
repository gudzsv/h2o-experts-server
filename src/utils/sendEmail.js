import nodemailer from 'nodemailer';
import { env } from './env.js';
import { ENV_VARS } from '../constants/index.js';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = ENV_VARS.BREVO;

const transporter = nodemailer.createTransport({
  host: env(SMTP_HOST),
  port: Number(env(SMTP_PORT)),
  auth: {
    user: env(SMTP_USER),
    pass: env(SMTP_PASSWORD),
  },
});

export const sendEmail = async (options) => {
  return await transporter.sendMail(options);
};

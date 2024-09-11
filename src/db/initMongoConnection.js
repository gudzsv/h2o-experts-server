import mongoose from 'mongoose';
import { env } from '../utils/env.js';
import { ENV_VARS } from '../constants/index.js';

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
  ENV_VARS.MONGO;

export const initMongoConnection = async () => {
  try {
    const user = env(MONGODB_USER);
    const pwd = env(MONGODB_PASSWORD);
    const url = env(MONGODB_URL);
    const db = env(MONGODB_DB);

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority&appName=Cluster01`,
    );

    console.log(`Mongo connection successfully established!`);
  } catch (error) {
    console.error(`Error while setting up mongo connection`, error);
    throw error;
  }
};

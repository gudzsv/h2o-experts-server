import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import pino from 'pino-http';
import { env } from './utils/env.js';
import { ENV_VARS } from './constants/index.js';
import { corsConfigs } from './configs/corsConfigs.js';
import { pinoConfigs } from './configs/pinoConfigs.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routers/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { addCorsHeaders } from './middlewares/addCorsHeaders.js';
import { UPLOAD_DIR } from './constants/index.js';

const PORT = Number(env(ENV_VARS.APP_PORT, 3000));

export const setupServer = () => {
  const app = express();

  app.use(cors(corsConfigs));

  app.use(cookieParser());

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(addCorsHeaders);

  app.use(pino(pinoConfigs));

  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use('/api-docs', swaggerDocs());

  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
  });
};

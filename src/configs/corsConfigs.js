export const corsConfigs = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://h2o-experts-app.vercel.app',
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

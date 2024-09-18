import { Router } from 'express';
import waterRouter from './water.js';
import authRouter from './auth.js';
import userRouter from './user.js';

import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/water', authenticate, waterRouter);

export default router;

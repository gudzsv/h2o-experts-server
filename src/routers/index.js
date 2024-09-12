import { Router } from 'express';
import waterRouter from './water.js';
import authRouter from './user.js';

import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use('/user', authRouter);
router.use('/water', authenticate, waterRouter);

export default router;

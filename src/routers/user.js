import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

import { updateUserSchema } from '../validation/users.js';
import {
  countUsersController,
  getUserByIdController,
  patchUserController,
} from '../controllers/users.js';

const router = Router();

router.get('/count', ctrlWrapper(countUsersController));

router.use(authenticate);

router.get('/', ctrlWrapper(getUserByIdController));

router.patch(
  '/',
  upload.single('photo'),
  validateBody(updateUserSchema),
  ctrlWrapper(patchUserController),
);

export default router;

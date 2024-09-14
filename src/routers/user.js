import { json, Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isValidId } from '../middlewares/isValidId.js';
import { upload } from '../middlewares/multer.js';

import { userSchema, updateUserSchema } from '../validation/users.js';
import {
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  getUserByIdController,
  patchUserController,
} from '../controllers/users.js';

const router = Router();
const jsonParser = json();

router.post(
  '/register',
  jsonParser,
  validateBody(userSchema),
  ctrlWrapper(registerUserController),
);

router.post(
  '/login',
  jsonParser,
  validateBody(userSchema),
  ctrlWrapper(loginUserController),
);

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post('/logout', ctrlWrapper(logoutUserController));

router.use(authenticate);

router.get('/', ctrlWrapper(getUserByIdController));

router.patch(
  '/',
  upload.single('photo'),
  validateBody(updateUserSchema),
  ctrlWrapper(patchUserController),
);

export default router;

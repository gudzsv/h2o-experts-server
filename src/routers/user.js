import { json, Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

import {
  userSchema,
  updateUserSchema,
  sendResetEmailSchema,
  resetPasswordSchema,
  loginWithGoogleOAuthSchema,
} from '../validation/users.js';
import {
  countUsersController,
  loginUserController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  getUserByIdController,
  patchUserController,
  sendResetEmailController,
  resetPasswordController,
  getGoogleOAuthUrlController,
  loginWithGoogleController,
} from '../controllers/users.js';

const router = Router();
const jsonParser = json();

router.get('/count', ctrlWrapper(countUsersController));

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

router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  '/confirm-oauth',
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

router.use(authenticate);

router.get('/', ctrlWrapper(getUserByIdController));

router.patch(
  '/',
  upload.single('photo'),
  validateBody(updateUserSchema),
  ctrlWrapper(patchUserController),
);

router.post(
  '/send-reset-email',
  jsonParser,
  validateBody(sendResetEmailSchema),
  ctrlWrapper(sendResetEmailController),
);

router.post(
  '/reset-pwd',
  jsonParser,
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

export default router;

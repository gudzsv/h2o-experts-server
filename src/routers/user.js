import { json, Router } from 'express';

const router = Router();
const jsonParser = json();

router.post(
  '/register',
  jsonParser,
  // validateBody(registerUserSchema),
  // ctrlWrapper(registerUserController),
);

export default router;

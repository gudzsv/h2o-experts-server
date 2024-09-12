import { json, Router } from 'express';
import { validateBody } from './../middlewares/validateBody.js';
import { addWaterSchema, updateWaterSchema } from '../validation/water.js';
import {
  addWaterController,
  deleteWaterController,
  updateWaterController,
} from './../controllers/water.js';
import { ctrlWrapper } from './../utils/ctrlWrapper.js';
import { isValidId } from './../middlewares/isValidId.js';

const router = Router();
const jsonParser = json();

router.post(
  '/',
  jsonParser,
  validateBody(addWaterSchema),
  ctrlWrapper(addWaterController),
);

router.patch(
  '/:waterId',
  jsonParser,
  isValidId('waterId'),
  validateBody(updateWaterSchema),
  ctrlWrapper(updateWaterController),
);

router.delete(
  '/:waterId',
  jsonParser,
  isValidId('waterId'),
  ctrlWrapper(deleteWaterController),
);

export default router;

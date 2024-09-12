import { json, Router } from 'express';
import { validateBody } from './../middlewares/validateBody.js';
import {
  addWaterSchema,
  dateSchema,
  monthSchema,
  updateWaterSchema,
} from '../validation/water.js';
import {
  addWaterController,
  dateWaterController,
  deleteWaterController,
  monthWaterController,
  updateWaterController,
} from './../controllers/water.js';
import { ctrlWrapper } from './../utils/ctrlWrapper.js';
import { isValidId } from './../middlewares/isValidId.js';
import { validateParams } from '../middlewares/validateParams.js';

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

router.get(
  '/day/:date',
  validateParams(dateSchema),
  ctrlWrapper(dateWaterController),
);

router.get(
  '/month/:yearMonth',
  validateParams(monthSchema),
  ctrlWrapper(monthWaterController),
);

export default router;

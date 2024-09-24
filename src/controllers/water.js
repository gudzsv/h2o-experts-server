import createHttpError from 'http-errors';
import {
  addWater,
  deleteWater,
  getmonthWater,
  getWaterByDate,
  updateWater,
} from '../services/water.js';
import { HTTP_STATUSES } from '../constants/index.js';

let STATUS_OK = HTTP_STATUSES.OK;
const STATUS_CREATED = HTTP_STATUSES.CREATED;
const STATUS_NO_CONTENT = HTTP_STATUSES.NO_CONTENT;

export const addWaterController = async (req, res, next) => {
  const usedWater = req.body.usedWater;
  const drinkingTime = req.body.drinkingTime;
  const userId = req.user._id;

  const water = await addWater({ usedWater, drinkingTime, userId });

  res.status(STATUS_CREATED).json({
    status: STATUS_CREATED,
    message: 'Water added successfully',
    data: water,
  });
};

export const updateWaterController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user._id;
  const usedWater = req.body.usedWater;
  const drinkingTime = req.body.drinkingTime;

  const water = await updateWater(waterId, userId, { usedWater, drinkingTime });

  if (!water) {
    return next(createHttpError.NotFound('Water not found'));
  }

  const status = water?.isNew ? STATUS_CREATED : STATUS_OK;

  res.status(status).json({
    status: status,
    message: 'Water successfully updated',
    data: water,
  });
};

export const deleteWaterController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user._id;

  const water = await deleteWater(waterId, userId);

  if (!water) {
    return next(createHttpError.NotFound('Water not found'));
  }

  res.status(STATUS_NO_CONTENT).send();
};

export const dateWaterController = async (req, res, next) => {
  const { date } = req.params;
  const userId = req.user._id;

  const waterByDate = await getWaterByDate(userId, date);

  if (!waterByDate) {
    return next(createHttpError.NotFound(`Water not found by date ${date}`));
  }

  res.status(STATUS_OK).json({
    status: STATUS_OK,
    message: 'Water by date found successfully',
    data: waterByDate,
  });
};

export const monthWaterController = async (req, res, next) => {
  const { yearMonth } = req.params;
  const userId = req.user._id;

  const waterByDateMonth = await getmonthWater(userId, yearMonth);
  if (!waterByDateMonth) {
    return next(
      createHttpError.NotFound(`Water not found by month ${yearMonth}`),
    );
  }

  res.status(STATUS_OK).json({
    status: STATUS_OK,
    message: 'Water by month found successfully',
    data: waterByDateMonth,
  });
};

import createHttpError from 'http-errors';
import {
  addWater,
  deleteWater,
  getDailyTotals,
  getHourlyTotals,
  getmonthWater,
  getWaterById,
  getWaterByDate,
  updateWater,
} from '../services/water.js';
import { HTTP_STATUSES } from '../constants/index.js';
import { calculateHydration } from '../utils/drinks.js';
import {
  calculateTimeOfDay,
  calculateWaterStats,
  getMonthStart,
} from '../utils/waterStats.js';

let STATUS_OK = HTTP_STATUSES.OK;
const STATUS_CREATED = HTTP_STATUSES.CREATED;
const STATUS_NO_CONTENT = HTTP_STATUSES.NO_CONTENT;

export const addWaterController = async (req, res, next) => {
  const { usedWater, drinkingTime, drinkType = 'water' } = req.body;
  const userId = req.user._id;

  const water = await addWater({
    usedWater,
    drinkingTime,
    drinkType,
    hydration: calculateHydration(usedWater, drinkType),
    userId,
  });

  res.status(STATUS_CREATED).json({
    status: STATUS_CREATED,
    message: 'Water added successfully',
    data: water,
  });
};

export const updateWaterController = async (req, res, next) => {
  const { waterId } = req.params;
  const userId = req.user._id;
  const { usedWater, drinkingTime, drinkType } = req.body;
  const changes = { usedWater, drinkingTime, drinkType };

  // The counted ml depend on both the volume and the type, so a change of
  // either needs the other one from the saved entry.
  if (usedWater !== undefined || drinkType !== undefined) {
    const current = await getWaterById(waterId, userId);
    if (!current) {
      return next(createHttpError.NotFound('Water not found'));
    }
    changes.hydration = calculateHydration(
      usedWater ?? current.usedWater,
      drinkType ?? current.drinkType,
    );
  }

  const { data: water, isNew } = await updateWater(waterId, userId, changes);

  if (!water) {
    return next(createHttpError.NotFound('Water not found'));
  }

  const status = isNew ? STATUS_CREATED : STATUS_OK;

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
    date: waterByDate,
  });
};

export const statsWaterController = async (req, res) => {
  const { today } = req.query;
  const { _id: userId, dailyRequirement } = req.user;

  const [dailyTotals, hourlyTotals] = await Promise.all([
    getDailyTotals(userId),
    getHourlyTotals(userId, getMonthStart(today), today),
  ]);

  res.status(STATUS_OK).json({
    status: STATUS_OK,
    message: 'Water stats calculated successfully',
    data: {
      ...calculateWaterStats(dailyTotals, { today, dailyRequirement }),
      timeOfDay: calculateTimeOfDay(hourlyTotals),
    },
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
    date: waterByDateMonth,
  });
};

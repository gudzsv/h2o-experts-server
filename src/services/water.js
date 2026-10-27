import { WaterCollection } from '../db/models/water.js';

// Stats count the ml toward the goal; entries from before drink types have
// no `hydration` and count as water.
const COUNTED_ML = { $ifNull: ['$hydration', '$usedWater'] };

export const addWater = async (payload) =>
  await WaterCollection.create(payload);

export const updateWater = async (waterId, userId, payload, options = {}) => {
  const water = await WaterCollection.findOneAndUpdate(
    {
      _id: waterId,
      userId,
    },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );

  return {
    data: water.value,
    isNew: Boolean(water?.lastErrorObject?.upserted),
  };
};

export const getWaterById = async (waterId, userId) =>
  await WaterCollection.findOne({ _id: waterId, userId });

export const deleteWater = async (waterId, userId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
    userId,
  });

  return water;
};

export const getWaterByDate = async (userId, date) => {
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const water = await WaterCollection.find({
    userId,
    drinkingTime: { $gte: startOfDay, $lte: endOfDay },
  });

  return water;
};

export const getmonthWater = async (userId, yearMonth) => {
  const startOfMonth = `${yearMonth}-01T00:00:00`;
  const endOfMonth = `${yearMonth}-31T23:59:59`;

  const water = await WaterCollection.find({
    userId,
    drinkingTime: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return water;
};

export const getDailyTotals = async (userId) =>
  await WaterCollection.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: { $substrBytes: ['$drinkingTime', 0, 10] },
        total: { $sum: COUNTED_ML },
        // True when some water was drunk at 05:00-08:59.
        early: {
          $max: {
            $and: [
              { $gte: [{ $substrBytes: ['$drinkingTime', 11, 2] }, '05'] },
              { $lt: [{ $substrBytes: ['$drinkingTime', 11, 2] }, '09'] },
            ],
          },
        },
      },
    },
    { $project: { _id: 0, date: '$_id', total: 1, early: 1 } },
  ]);

// Water per hour of the day (characters 11-12 of drinkingTime) between two
// dates, both included.
export const getHourlyTotals = async (userId, fromDate, toDate) =>
  await WaterCollection.aggregate([
    {
      $match: {
        userId,
        drinkingTime: {
          $gte: `${fromDate}T00:00:00`,
          $lte: `${toDate}T23:59:59`,
        },
      },
    },
    {
      $group: {
        _id: { $substrBytes: ['$drinkingTime', 11, 2] },
        total: { $sum: COUNTED_ML },
      },
    },
    { $project: { _id: 0, hour: '$_id', total: 1 } },
  ]);

import { WaterCollection } from '../db/models/water.js';

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

  const water = await WaterCollection.findOne({
    userId,
    drinkingTime: { $gte: startOfDay, $lte: endOfDay },
  });

  return water;
};

export const getmonthWater = async (userId, yearMonth) => {
  const startOfMonth = `${yearMonth}-01T00:00:00`;
  const endOfMonth = `${yearMonth}-31T23:59:59`;

  const water = await WaterCollection.findOne({
    userId,
    drinkingTime: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return water;
};

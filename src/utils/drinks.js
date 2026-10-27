// The share of a drink that counts toward the daily water goal, as in
// popular water trackers. The frontend keeps the same table
// (src/helpers/drinks.js) to preview the counted amount; keep them in sync.
export const DRINK_COEFFICIENTS = {
  water: 1,
  tea: 0.9,
  milk: 0.9,
  coffee: 0.8,
  juice: 0.8,
  soda: 0.7,
};

export const DRINK_TYPES = Object.keys(DRINK_COEFFICIENTS);

// Ml that count toward the goal. Entries without a type are water.
export const calculateHydration = (usedWater, drinkType = 'water') =>
  Math.round(usedWater * (DRINK_COEFFICIENTS[drinkType] ?? 1));

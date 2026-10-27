import { model, Schema } from 'mongoose';
import { DRINK_TYPES } from '../../utils/drinks.js';

const waterSchema = new Schema(
  {
    usedWater: {
      type: Number,
      required: true,
      default: 0,
    },
    drinkingTime: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('.')[0],
    },
    drinkType: { type: String, enum: DRINK_TYPES, default: 'water' },
    // Ml that count toward the goal (usedWater times the drink's share), set
    // on every write. Entries from before drink types have none: use usedWater.
    hydration: { type: Number },
    userId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// The day and month queries filter by user and a drinkingTime range.
waterSchema.index({ userId: 1, drinkingTime: 1 });

export const WaterCollection = model('water', waterSchema);

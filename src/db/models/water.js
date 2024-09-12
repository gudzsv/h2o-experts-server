import { model, Schema } from 'mongoose';

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
    userId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const WaterCollection = model('water', waterSchema);

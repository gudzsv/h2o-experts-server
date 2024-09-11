import { model, Schema } from 'mongoose';

const waterSchema = new Schema(
  {
    amountOfWater: {
      type: Number,
      required: true,
    },
    recordingTime: {
      type: String,
      default: Date.now,
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContactsCollection = model('contact', waterSchema);

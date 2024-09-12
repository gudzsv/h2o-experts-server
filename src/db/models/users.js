import { Schema, model } from 'mongoose';

const usersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'User',
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please fill a valid email address'],
    },

    password: {
      type: String,
      required: true,
    },

    weight: {
      type: Number,
    },

    activityLevel: {
      type: Number,
    },

    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'female',
    },

    dailyRequirement: {
      type: Number,
      default: 2000,
    },

    photo: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

usersSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UserCollection = model('user', usersSchema);

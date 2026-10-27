import { model, Schema } from 'mongoose';

const sessionsSchema = new Schema(
  {
    userId: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

sessionsSchema.index({ accessToken: 1 });
sessionsSchema.index({ userId: 1 });
// Remove sessions automatically once their refresh token has expired.
sessionsSchema.index({ refreshTokenValidUntil: 1 }, { expireAfterSeconds: 0 });

export const SessionCollection = model('session', sessionsSchema);

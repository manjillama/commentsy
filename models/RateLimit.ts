import { Document, Schema } from "mongoose";
import createModel from "@/lib/createModel";

interface RateLimitDocument extends Document<string> {
  count: number;
  expiresAt: Date;
}

const schema = new Schema<RateLimitDocument>({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default createModel<RateLimitDocument>("RateLimit", schema);

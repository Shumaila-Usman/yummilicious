import { Schema, models, model } from "mongoose";

export interface ICoupon {
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = models.Coupon || model<ICoupon>("Coupon", CouponSchema);

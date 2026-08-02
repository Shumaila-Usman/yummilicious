import { Schema, models, model, Types } from "mongoose";

export interface IPromotion {
  title: string;
  slug: string;
  description?: string;
  type: "percentage" | "fixed" | "sale_price";
  value: number;
  applyTo: "product" | "category" | "all";
  productIds: Types.ObjectId[];
  categoryIds: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  showBadge: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    type: { type: String, enum: ["percentage", "fixed", "sale_price"], required: true },
    value: { type: Number, required: true },
    applyTo: { type: String, enum: ["product", "category", "all"], default: "product" },
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    showBadge: { type: Boolean, default: true },
    image: String,
  },
  { timestamps: true }
);

export const Promotion = models.Promotion || model<IPromotion>("Promotion", PromotionSchema);

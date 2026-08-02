import { Schema, models, model, Types } from "mongoose";

export interface IAddOn {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  size?: string;
  image?: string;
  isActive: boolean;
  applicableProducts: Types.ObjectId[];
  applicableCategories: Types.ObjectId[];
  maxQuantity: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    salePrice: Number,
    size: String,
    image: String,
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    maxQuantity: { type: Number, default: 5 },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AddOn = models.AddOn || model<IAddOn>("AddOn", AddOnSchema);

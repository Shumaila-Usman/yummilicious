import { Schema, models, model, Types } from "mongoose";
import type { DietaryTag, IInventory, IProductOption, ISaleConfig, IVariant } from "@/types";

export interface IProductImage {
  url: string;
  alt?: string;
  publicId?: string;
  order: number;
}

export interface IProduct {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categories: Types.ObjectId[];
  basePrice: number;
  variants: IVariant[];
  options: IProductOption[];
  addonIds: Types.ObjectId[];
  images: IProductImage[];
  featuredImage?: string;
  ingredients: string[];
  dietaryTags: DietaryTag[];
  includes?: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  isSoldOut: boolean;
  inventory: IInventory;
  preparationTime?: number;
  sale: ISaleConfig;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder: number;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    sku: String,
    isDefault: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: true }
);

const OptionChoiceSchema = new Schema(
  {
    label: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false }
);

const OptionSchema = new Schema(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    type: { type: String, enum: ["single", "multiple"], default: "single" },
    choices: [OptionChoiceSchema],
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    basePrice: { type: Number, required: true },
    variants: [VariantSchema],
    options: [OptionSchema],
    addonIds: [{ type: Schema.Types.ObjectId, ref: "AddOn" }],
    images: [
      {
        url: String,
        alt: String,
        publicId: String,
        order: { type: Number, default: 0 },
      },
    ],
    featuredImage: String,
    ingredients: [String],
    dietaryTags: [{ type: String }],
    includes: [String],
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    isSoldOut: { type: Boolean, default: false },
    inventory: {
      track: { type: Boolean, default: false },
      quantity: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
    },
    preparationTime: Number,
    sale: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ["percentage", "fixed", "sale_price"], default: "percentage" },
      value: { type: Number, default: 0 },
      startDate: Date,
      endDate: Date,
      showBadge: { type: Boolean, default: true },
    },
    seoTitle: String,
    seoDescription: String,
    displayOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", shortDescription: "text" });
ProductSchema.index({ isFeatured: 1, isAvailable: 1, isDeleted: 1 });

export const Product = models.Product || model<IProduct>("Product", ProductSchema);

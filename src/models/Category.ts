import { Schema, models, model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: String,
    icon: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

export const Category = models.Category || model<ICategory>("Category", CategorySchema);

import { Schema, models, model } from "mongoose";

export interface IGalleryImage {
  title: string;
  alt: string;
  url: string;
  publicId?: string;
  category: "breakfast" | "sandwiches" | "rolls" | "shawarma" | "tea" | "behind-the-scenes" | "general";
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: { type: String, required: true },
    alt: { type: String, required: true },
    url: { type: String, required: true },
    publicId: String,
    category: {
      type: String,
      enum: ["breakfast", "sandwiches", "rolls", "shawarma", "tea", "behind-the-scenes", "general"],
      default: "general",
    },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GalleryImage =
  models.GalleryImage || model<IGalleryImage>("GalleryImage", GalleryImageSchema);

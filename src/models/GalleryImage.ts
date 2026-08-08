import { Schema, models, model } from "mongoose";

export interface IGalleryImage {
  title: string;
  alt: string;
  url: string;
  publicId?: string;
  /** Category slug (dynamic — managed in GalleryCategory) */
  category: string;
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
    category: { type: String, default: "general", index: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GalleryImage =
  models.GalleryImage || model<IGalleryImage>("GalleryImage", GalleryImageSchema);

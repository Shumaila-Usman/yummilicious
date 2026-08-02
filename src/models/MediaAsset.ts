import { Schema, models, model } from "mongoose";

export interface IMediaAsset {
  url: string;
  publicId?: string;
  filename: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder?: string;
  alt?: string;
  tags: string[];
  usedIn: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    publicId: String,
    filename: { type: String, required: true },
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    folder: String,
    alt: String,
    tags: [String],
    usedIn: [String],
  },
  { timestamps: true }
);

export const MediaAsset =
  models.MediaAsset || model<IMediaAsset>("MediaAsset", MediaAssetSchema);

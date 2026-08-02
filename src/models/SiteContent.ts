import { Schema, models, model } from "mongoose";

export interface ISiteContent {
  key: string;
  section: string;
  data: Record<string, unknown>;
  updatedAt: Date;
  createdAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    key: { type: String, required: true, unique: true },
    section: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const SiteContent =
  models.SiteContent || model<ISiteContent>("SiteContent", SiteContentSchema);

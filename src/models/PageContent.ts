import { Schema, models, model } from "mongoose";

export interface IPageSectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
}

export interface IPageSection {
  key: string;
  title: string;
  fields: IPageSectionField[];
}

export interface IPageContent {
  slug: string;
  title: string;
  sections: IPageSection[];
  createdAt: Date;
  updatedAt: Date;
}

const FieldSchema = new Schema<IPageSectionField>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["text", "textarea", "image"], required: true },
    value: { type: String, default: "" },
  },
  { _id: false }
);

const SectionSchema = new Schema<IPageSection>(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    fields: { type: [FieldSchema], default: [] },
  },
  { _id: false }
);

const PageContentSchema = new Schema<IPageContent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

export const PageContent =
  models.PageContent || model<IPageContent>("PageContent", PageContentSchema);

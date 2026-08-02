import { Schema, models, model } from "mongoose";

export interface IContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactSubmission =
  models.ContactSubmission ||
  model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);

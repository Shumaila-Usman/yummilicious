import { Schema, models, model } from "mongoose";

export interface ITestimonial {
  name: string;
  quote: string;
  role?: string;
  photo?: string;
  rating: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    quote: { type: String, required: true },
    role: String,
    photo: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Testimonial =
  models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema);

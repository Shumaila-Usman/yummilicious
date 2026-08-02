import { Schema, models, model } from "mongoose";

export interface ICustomer {
  fullName: string;
  phone: string;
  email?: string;
  addresses: {
    label?: string;
    address: string;
    area: string;
    city: string;
    landmark?: string;
  }[];
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: String,
    addresses: [
      {
        label: String,
        address: String,
        area: String,
        city: String,
        landmark: String,
      },
    ],
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: Date,
    notes: String,
  },
  { timestamps: true }
);

export const Customer = models.Customer || model<ICustomer>("Customer", CustomerSchema);

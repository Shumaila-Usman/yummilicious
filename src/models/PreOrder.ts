import { Schema, models, model } from "mongoose";

export type PreOrderStatus =
  | "pending_review"
  | "confirmed"
  | "preparing"
  | "completed"
  | "cancelled";

export interface IPreOrder {
  preOrderNumber: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
  };
  event: {
    date: string;
    timeWindow: string;
    occasion?: string;
    guestCount: number;
  };
  delivery: {
    address: string;
    area: string;
    city: string;
    landmark?: string;
    instructions?: string;
  };
  items: {
    productId: string;
    slug: string;
    name: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
  }[];
  orderDetails: string;
  estimatedTotal: number;
  payment: {
    method: "jazzcash" | "easypaisa" | "bank";
    amountPaid: number;
    transactionId: string;
    paidInFull: boolean;
  };
  status: PreOrderStatus;
  internalNotes?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PreOrderSchema = new Schema<IPreOrder>(
  {
    preOrderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      alternatePhone: String,
    },
    event: {
      date: { type: String, required: true },
      timeWindow: { type: String, required: true },
      occasion: String,
      guestCount: { type: Number, required: true, min: 1 },
    },
    delivery: {
      address: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true, default: "Islamabad" },
      landmark: String,
      instructions: String,
    },
    items: [
      {
        productId: { type: String, required: true },
        slug: String,
        name: { type: String, required: true },
        variantName: String,
        unitPrice: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    orderDetails: { type: String, default: "" },
    estimatedTotal: { type: Number, required: true, min: 0 },
    payment: {
      method: {
        type: String,
        enum: ["jazzcash", "easypaisa", "bank"],
        required: true,
      },
      amountPaid: { type: Number, required: true, min: 1 },
      transactionId: { type: String, required: true },
      paidInFull: { type: Boolean, required: true, default: true },
    },
    status: {
      type: String,
      enum: ["pending_review", "confirmed", "preparing", "completed", "cancelled"],
      default: "pending_review",
    },
    internalNotes: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PreOrder =
  models.PreOrder || model<IPreOrder>("PreOrder", PreOrderSchema);

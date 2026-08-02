import { Schema, models, model, Types } from "mongoose";
import type { OrderStatus, PaymentMethod, OrderItemSnapshot } from "@/types";

export interface IStatusHistory {
  status: OrderStatus;
  note?: string;
  changedAt: Date;
  changedBy?: string;
}

export interface IOrderCustomer {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
}

export interface IOrderDelivery {
  address: string;
  area: string;
  city: string;
  landmark?: string;
  instructions?: string;
  preferredTime?: string;
}

export interface IOrder {
  orderNumber: string;
  sequence: number;
  customer: IOrderCustomer;
  delivery: IOrderDelivery;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentTransactionId?: string;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  internalNotes?: string;
  customerId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: String,
    name: { type: String, required: true },
    image: String,
    variant: {
      name: String,
      price: Number,
    },
    options: [
      {
        optionName: String,
        choice: String,
        priceModifier: Number,
      },
    ],
    addons: [
      {
        addonId: String,
        name: String,
        size: String,
        price: Number,
        quantity: Number,
      },
    ],
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    specialInstructions: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    sequence: { type: Number, required: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      alternatePhone: String,
      email: String,
    },
    delivery: {
      address: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true, default: "Karachi" },
      landmark: String,
      instructions: String,
      preferredTime: String,
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    paymentMethod: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank", "cod", "online"],
      default: "jazzcash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentTransactionId: String,
    status: {
      type: String,
      enum: [
        "received",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "received",
    },
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
      },
    ],
    internalNotes: String,
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);

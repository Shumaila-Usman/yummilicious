import { Schema, models, model } from "mongoose";

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: "admin" | "superadmin" | "editor";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "superadmin", "editor"], default: "admin" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export const Admin = models.Admin || model<IAdmin>("Admin", AdminSchema);

import { Schema, models, model } from "mongoose";
import type { StoreHoursShift } from "@/types";

export interface ISettings {
  brandName: string;
  tagline: string;
  supportingLine: string;
  logo: string;
  favicon: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryMin?: number;
  minimumOrderValue: number;
  taxEnabled: boolean;
  taxRate: number;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
  };
  businessHours: StoreHoursShift[];
  storeOpen: boolean;
  estimatedPrepTime: number;
  deliveryAreas: string[];
  announcementBar?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  onlinePaymentEnabled: boolean;
  orderNotifications: {
    email: boolean;
    whatsapp: boolean;
  };
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  reviews: {
    name: string;
    rating: number;
    comment: string;
    date?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    brandName: { type: String, default: "Yummilicious" },
    tagline: { type: String, default: "Homemade Comfort. Unforgettable Flavour." },
    supportingLine: {
      type: String,
      default:
        "Freshly prepared homemade favourites, made with care and delivered with flavour.",
    },
    logo: { type: String, default: "/images/logo.svg" },
    favicon: { type: String, default: "/favicon.ico" },
    currency: { type: String, default: "PKR" },
    deliveryFee: { type: Number, default: 150 },
    freeDeliveryMin: Number,
    minimumOrderValue: { type: Number, default: 300 },
    taxEnabled: { type: Boolean, default: false },
    taxRate: { type: Number, default: 0 },
    whatsappNumber: { type: String, default: "923369863734" },
    phone: { type: String, default: "03369863734" },
    email: { type: String, default: "yummilicious321@gmail.com" },
    address: { type: String, default: "Islamabad, Pakistan" },
    city: { type: String, default: "Islamabad" },
    socialLinks: {
      instagram: String,
      facebook: String,
      tiktok: String,
      youtube: String,
    },
    businessHours: {
      type: [
        {
          label: String,
          start: String,
          end: String,
        },
      ],
      default: [
        { label: "Morning", start: "09:00", end: "12:00" },
        { label: "Evening", start: "20:00", end: "23:00" },
      ],
    },
    storeOpen: { type: Boolean, default: true },
    estimatedPrepTime: { type: Number, default: 30 },
    deliveryAreas: { type: [String], default: ["Karachi"] },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: {
        type: String,
        default: "Ordering windows: 9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM",
      },
      link: String,
    },
    onlinePaymentEnabled: { type: Boolean, default: false },
    orderNotifications: {
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
    },
    seo: {
      title: { type: String, default: "Yummilicious | Homemade Comfort. Unforgettable Flavour." },
      description: {
        type: String,
        default:
          "Freshly prepared homemade favourites — breakfasts, shawarmas, paratha rolls and tea — made with care in Pakistan.",
      },
      ogImage: String,
    },
    reviews: [
      {
        name: String,
        rating: Number,
        comment: String,
        date: String,
      },
    ],
  },
  { timestamps: true }
);

export const Settings = models.Settings || model<ISettings>("Settings", SettingsSchema);

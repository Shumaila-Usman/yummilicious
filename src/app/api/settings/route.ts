import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Settings } from "@/models/Settings";
import { getSettingsDoc, serialize, jsonValidationError } from "@/lib/api/helpers";

const settingsUpdateSchema = z.object({
  brandName: z.string().optional(),
  tagline: z.string().optional(),
  supportingLine: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  currency: z.string().optional(),
  deliveryFee: z.number().optional(),
  freeDeliveryMin: z.number().optional(),
  minimumOrderValue: z.number().optional(),
  taxEnabled: z.boolean().optional(),
  taxRate: z.number().optional(),
  whatsappNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
  businessHours: z
    .array(
      z.object({
        label: z.string(),
        start: z.string(),
        end: z.string(),
      })
    )
    .optional(),
  storeOpen: z.boolean().optional(),
  estimatedPrepTime: z.number().optional(),
  deliveryAreas: z.array(z.string()).optional(),
  announcementBar: z
    .object({
      enabled: z.boolean(),
      text: z.string(),
      link: z.string().optional(),
    })
    .optional(),
  onlinePaymentEnabled: z.boolean().optional(),
  orderNotifications: z
    .object({
      email: z.boolean(),
      whatsapp: z.boolean(),
    })
    .optional(),
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    })
    .optional(),
  reviews: z
    .array(
      z.object({
        name: z.string(),
        rating: z.number(),
        comment: z.string(),
        date: z.string().optional(),
      })
    )
    .optional(),
});

function stripSensitive(settings: Record<string, unknown>) {
  const { orderNotifications: _orderNotifications, ...publicSettings } = settings;
  return publicSettings;
}

export async function GET() {
  try {
    const settings = await getSettingsDoc();
    return NextResponse.json(serialize(stripSensitive(settings as Record<string, unknown>)));
  } catch (error) {
    console.error("GET /api/settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    Object.assign(settings, parsed.data);
    await settings.save();

    return NextResponse.json(serialize(settings.toObject()));
  } catch (err) {
    console.error("PATCH /api/settings:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

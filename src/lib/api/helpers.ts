import { NextResponse } from "next/server";

export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20)
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonValidationError(errors: unknown) {
  return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
}

export async function getSettingsDoc() {
  const { connectDB } = await import("@/lib/db/connect");
  const { Settings } = await import("@/models/Settings");
  const { FALLBACK_SETTINGS } = await import("@/lib/data/fallback");
  await connectDB();
  let settings = await Settings.findOne().lean();
  if (!settings) {
    const created = await Settings.create({
      deliveryFee: FALLBACK_SETTINGS.deliveryFee,
      freeDeliveryMin: FALLBACK_SETTINGS.freeDeliveryMin,
      minimumOrderValue: FALLBACK_SETTINGS.minimumOrderValue,
    });
    settings = created.toObject();
  }
  return settings;
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AddOn } from "@/models/AddOn";
import { addonSchema } from "@/lib/validations";
import { slugifyText } from "@/lib/utils/format";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const adminView = searchParams.get("admin") === "true";

    const filter = adminView ? {} : { isActive: true };

    const [addons, total] = await Promise.all([
      AddOn.find(filter).sort({ displayOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
      AddOn.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        addons,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/addons:", error);
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = addonSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();

    let slug = slugifyText(parsed.data.name);
    const existing = await AddOn.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const addon = await AddOn.create({ ...parsed.data, slug });
    return NextResponse.json(serialize(addon.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/addons:", err);
    return NextResponse.json({ error: "Failed to create addon" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Promotion } from "@/models/Promotion";
import { slugifyText } from "@/lib/utils/format";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const promotionSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed", "sale_price"]),
  value: z.number().min(0),
  applyTo: z.enum(["product", "category", "all"]).optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean().optional(),
  showBadge: z.boolean().optional(),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const adminView = searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};
    if (!adminView) {
      const now = new Date();
      filter.isActive = true;
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    const [promotions, total] = await Promise.all([
      Promotion.find(filter)
        .populate("productIds", "name slug")
        .populate("categoryIds", "name slug")
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Promotion.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        promotions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/promotions:", error);
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();

    let slug = slugifyText(parsed.data.title);
    const existing = await Promotion.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const promotion = await Promotion.create({
      ...parsed.data,
      slug,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
    });

    return NextResponse.json(serialize(promotion.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/promotions:", err);
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}

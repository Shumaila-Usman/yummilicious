import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Coupon } from "@/models/Coupon";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const couponSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const [coupons, total] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Coupon.countDocuments(),
    ]);

    return NextResponse.json(
      serialize({
        coupons,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/coupons:", err);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const coupon = await Coupon.create({
      ...parsed.data,
      code: parsed.data.code.toUpperCase(),
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
    });

    return NextResponse.json(serialize(coupon.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/coupons:", err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

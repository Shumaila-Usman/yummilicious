import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/models/Coupon";
import { jsonValidationError } from "@/lib/api/helpers";

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const coupon = await Coupon.findOne({
      code: parsed.data.code.toUpperCase(),
      isActive: true,
    }).lean();

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code." });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ valid: false, error: "This coupon is not yet active." });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." });
    }
    if (parsed.data.subtotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of PKR ${coupon.minOrderValue} required.`,
      });
    }

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = Math.round((parsed.data.subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    discount = Math.min(discount, parsed.data.subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      description: coupon.description,
    });
  } catch (error) {
    console.error("POST /api/coupons/validate:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}

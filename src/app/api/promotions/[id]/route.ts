import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Promotion } from "@/models/Promotion";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const promotionUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed", "sale_price"]).optional(),
  value: z.number().min(0).optional(),
  applyTo: z.enum(["product", "category", "all"]).optional(),
  productIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  showBadge: z.boolean().optional(),
  image: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = promotionUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startDate) update.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) update.endDate = new Date(parsed.data.endDate);

    const promotion = await Promotion.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(promotion));
  } catch (err) {
    console.error("PATCH /api/promotions/[id]:", err);
    return NextResponse.json({ error: "Failed to update promotion" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/promotions/[id]:", err);
    return NextResponse.json({ error: "Failed to delete promotion" }, { status: 500 });
  }
}

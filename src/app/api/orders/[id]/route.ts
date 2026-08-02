import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Order } from "@/models/Order";
import { serialize, jsonValidationError } from "@/lib/api/helpers";
import type { OrderStatus } from "@/types";

const orderUpdateSchema = z.object({
  status: z
    .enum([
      "received",
      "confirmed",
      "preparing",
      "ready",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  internalNotes: z.string().optional(),
  statusNote: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(order));
  } catch (err) {
    console.error("GET /api/orders/[id]:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (parsed.data.internalNotes !== undefined) {
      order.internalNotes = parsed.data.internalNotes;
    }

    if (parsed.data.status && parsed.data.status !== order.status) {
      order.status = parsed.data.status as OrderStatus;
      order.statusHistory.push({
        status: parsed.data.status as OrderStatus,
        note: parsed.data.statusNote,
        changedAt: new Date(),
        changedBy: session?.user?.email ?? undefined,
      });
    }

    await order.save();
    return NextResponse.json(serialize(order.toObject()));
  } catch (err) {
    console.error("PATCH /api/orders/[id]:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

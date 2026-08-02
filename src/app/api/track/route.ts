import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { trackOrderSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { Order } from "@/models/Order";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types";
import type { IOrder } from "@/models/Order";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`track:${ip}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = trackOrderSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();

    const order = await Order.findOne({
      orderNumber: parsed.data.orderNumber.toUpperCase(),
      "customer.phone": parsed.data.phone,
      isDeleted: false,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number and phone." },
        { status: 404 }
      );
    }

    const typedOrder = order as IOrder & { _id: unknown };
    const timeline = typedOrder.statusHistory.map((entry) => ({
      status: entry.status,
      label: ORDER_STATUS_LABELS[entry.status as OrderStatus],
      changedAt: entry.changedAt,
    }));

    return NextResponse.json(
      serialize({
        orderNumber: typedOrder.orderNumber,
        status: typedOrder.status,
        statusLabel: ORDER_STATUS_LABELS[typedOrder.status],
        timeline,
        createdAt: typedOrder.createdAt,
        total: typedOrder.total,
        items: typedOrder.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
      })
    );
  } catch (error) {
    console.error("POST /api/track:", error);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}

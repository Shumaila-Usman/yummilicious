import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { preOrderSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PreOrder } from "@/models/PreOrder";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

async function nextPreOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PO-${year}-`;
  const latest = await PreOrder.findOne({ preOrderNumber: new RegExp(`^${prefix}`) })
    .sort({ preOrderNumber: -1 })
    .select("preOrderNumber")
    .lean();

  let seq = 1;
  if (latest?.preOrderNumber) {
    const part = latest.preOrderNumber.split("-").pop();
    const n = parseInt(part || "0", 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`preorder:${ip}`, 4, 60_000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = preOrderSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    const data = parsed.data;
    await connectDB();

    const preOrderNumber = await nextPreOrderNumber();
    const doc = await PreOrder.create({
      preOrderNumber,
      customer: {
        fullName: data.customer.fullName,
        phone: data.customer.phone,
        email: data.customer.email || undefined,
        alternatePhone: data.customer.alternatePhone || undefined,
      },
      event: {
        date: data.event.date,
        timeWindow: data.event.timeWindow,
        occasion: data.event.occasion || undefined,
        guestCount: data.event.guestCount,
      },
      delivery: {
        address: data.delivery.address,
        area: data.delivery.area,
        city: data.delivery.city || "Islamabad",
        landmark: data.delivery.landmark || undefined,
        instructions: data.delivery.instructions || undefined,
      },
      orderDetails:
        data.orderDetails ||
        data.items
          .map(
            (i) =>
              `${i.quantity}× ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`
          )
          .join(", "),
      items: data.items,
      estimatedTotal: data.estimatedTotal,
      payment: {
        method: data.payment.method,
        amountPaid: data.payment.amountPaid,
        transactionId: data.payment.transactionId.trim(),
        paidInFull: true,
      },
      status: "pending_review",
    });

    return NextResponse.json(
      serialize({
        id: doc._id.toString(),
        preOrderNumber: doc.preOrderNumber,
        message:
          "Pre-order received! We’ll confirm on WhatsApp after verifying your payment.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/pre-order:", error);
    return NextResponse.json(
      { error: "Failed to submit pre-order. Please try again or WhatsApp us." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = {};
    const status = searchParams.get("status");
    if (status) filter.status = status;
    if (searchParams.get("unread") === "true") filter.isRead = false;

    const [preOrders, total] = await Promise.all([
      PreOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PreOrder.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        preOrders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/pre-order:", err);
    return NextResponse.json({ error: "Failed to fetch pre-orders" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { verifyJazzCashResponse } from "@/lib/payments/jazzcash";
import { notifyOrderEmails } from "@/lib/email/templates";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function redirectTo(path: string) {
  return NextResponse.redirect(new URL(path, siteUrl()));
}

async function handleReturn(raw: Record<string, string>) {
  const verified = verifyJazzCashResponse(raw);

  await connectDB();

  const orderNumber = verified.orderNumber?.trim();
  if (!orderNumber) {
    return redirectTo("/checkout?payment=failed&reason=missing_order");
  }

  const order = await Order.findOne({ orderNumber, isDeleted: false });
  if (!order) {
    return redirectTo("/checkout?payment=failed&reason=order_not_found");
  }

  if (order.paymentStatus === "paid") {
    return redirectTo(`/order-success?orderNumber=${encodeURIComponent(orderNumber)}`);
  }

  if (!verified.ok) {
    order.paymentStatus = "failed";
    if (verified.txnRef) order.paymentTransactionId = verified.txnRef;
    order.statusHistory.push({
      status: order.status,
      note: `JazzCash payment failed: ${verified.message} (${verified.responseCode})`,
      changedAt: new Date(),
    });
    await order.save();
    return redirectTo(
      `/checkout?payment=failed&orderNumber=${encodeURIComponent(orderNumber)}&reason=${encodeURIComponent(verified.message)}`
    );
  }

  order.paymentStatus = "paid";
  if (verified.txnRef) order.paymentTransactionId = verified.txnRef;
  if (order.status === "received") {
    order.status = "confirmed";
    order.statusHistory.push({
      status: "confirmed",
      note: `JazzCash payment verified (${verified.responseCode})`,
      changedAt: new Date(),
    });
  } else {
    order.statusHistory.push({
      status: order.status,
      note: `JazzCash payment verified (${verified.responseCode})`,
      changedAt: new Date(),
    });
  }
  await order.save();

  for (const item of order.items) {
    const product = await Product.findById(item.productId).select("inventory").lean();
    if (product?.inventory?.track) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { "inventory.quantity": -item.quantity },
      });
    }
  }

  notifyOrderEmails(order.toObject(), { paid: true });

  return redirectTo(`/order-success?orderNumber=${encodeURIComponent(orderNumber)}&paid=1`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const raw: Record<string, string> = {};
    formData.forEach((value, key) => {
      raw[key] = String(value);
    });
    return await handleReturn(raw);
  } catch (error) {
    console.error("POST /api/payments/jazzcash/return:", error);
    return redirectTo("/checkout?payment=failed&reason=server_error");
  }
}

export async function GET(request: NextRequest) {
  try {
    const raw: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      raw[key] = value;
    });
    return await handleReturn(raw);
  } catch (error) {
    console.error("GET /api/payments/jazzcash/return:", error);
    return redirectTo("/checkout?payment=failed&reason=server_error");
  }
}

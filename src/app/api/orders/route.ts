import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Order } from "@/models/Order";
import { parsePagination, serialize } from "@/lib/api/helpers";
import type { OrderStatus } from "@/types";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = { isDeleted: false };

    const status = searchParams.get("status");
    if (status) filter.status = status as OrderStatus;

    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.fullName": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) (filter.createdAt as Record<string, Date>).$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (filter.createdAt as Record<string, Date>).$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        orders,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/orders:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

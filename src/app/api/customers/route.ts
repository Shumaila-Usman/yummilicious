import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Customer } from "@/models/Customer";
import { parsePagination, serialize } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = {};
    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ lastOrderAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Customer.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        customers,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/customers:", err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

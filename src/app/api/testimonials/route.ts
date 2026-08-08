import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Testimonial } from "@/models/Testimonial";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const schema = z.object({
  name: z.string().min(1),
  quote: z.string().min(1),
  role: z.string().optional(),
  photo: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const adminView = searchParams.get("admin") === "true";
    const { page, limit, skip } = parsePagination(searchParams);
    const filter = adminView ? {} : { isActive: true };

    const [items, total] = await Promise.all([
      Testimonial.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        testimonials: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const item = await Testimonial.create(parsed.data);
    return NextResponse.json(serialize(item.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/testimonials:", err);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}

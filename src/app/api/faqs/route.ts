import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Faq } from "@/models/Faq";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const schema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
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
      Faq.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      Faq.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        faqs: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/faqs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
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
    const item = await Faq.create(parsed.data);
    return NextResponse.json(serialize(item.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/faqs:", err);
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Category } from "@/models/Category";
import { slugifyText } from "@/lib/utils/format";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const adminView = searchParams.get("admin") === "true";

    const filter = adminView ? {} : { isActive: true };

    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ displayOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        categories,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();

    let slug = slugifyText(parsed.data.name);
    const existing = await Category.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await Category.create({ ...parsed.data, slug });
    return NextResponse.json(serialize(category.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/categories:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

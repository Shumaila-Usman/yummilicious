import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Category } from "@/models/Category";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = categoryUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const category = await Category.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(category));
  } catch (err) {
    console.error("PATCH /api/categories/[id]:", err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id]:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

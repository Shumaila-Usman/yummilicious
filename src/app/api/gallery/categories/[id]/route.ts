import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GalleryCategory } from "@/models/GalleryCategory";
import { GalleryImage } from "@/models/GalleryImage";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const item = await GalleryCategory.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serialize(item));
  } catch (err) {
    console.error("PATCH /api/gallery/categories/[id]:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();
    const cat = await GalleryCategory.findById(id);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await GalleryImage.deleteMany({ category: cat.slug });
    await cat.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/gallery/categories/[id]:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

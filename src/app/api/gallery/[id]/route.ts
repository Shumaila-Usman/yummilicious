import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GalleryImage } from "@/models/GalleryImage";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const galleryUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  alt: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
  publicId: z.string().optional(),
  category: z.string().min(1).optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = galleryUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const image = await GalleryImage.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(image));
  } catch (err) {
    console.error("PATCH /api/gallery/[id]:", err);
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const image = await GalleryImage.findByIdAndDelete(id);
    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/gallery/[id]:", err);
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 });
  }
}

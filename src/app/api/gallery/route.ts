import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GalleryImage } from "@/models/GalleryImage";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";

const gallerySchema = z.object({
  title: z.string().min(1),
  alt: z.string().min(1),
  url: z.string().url(),
  publicId: z.string().optional(),
  category: z
    .enum(["breakfast", "sandwiches", "rolls", "shawarma", "tea", "behind-the-scenes", "general"])
    .optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const adminView = searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = adminView ? {} : { isActive: true };
    const category = searchParams.get("category");
    if (category) filter.category = category;

    const [images, total] = await Promise.all([
      GalleryImage.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
      GalleryImage.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        images,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const image = await GalleryImage.create(parsed.data);
    return NextResponse.json(serialize(image.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/gallery:", err);
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 });
  }
}

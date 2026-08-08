import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { GalleryCategory } from "@/models/GalleryCategory";
import { GalleryImage } from "@/models/GalleryImage";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const adminView = request.nextUrl.searchParams.get("admin") === "true";
    const filter = adminView ? {} : { isActive: true };
    const categories = await GalleryCategory.find(filter).sort({ displayOrder: 1 }).lean();

    const withCounts = await Promise.all(
      categories.map(async (c) => {
        const imageCount = await GalleryImage.countDocuments({
          category: c.slug,
          ...(adminView ? {} : { isActive: true }),
        });
        return { ...c, imageCount };
      })
    );

    // Seed defaults if empty
    if (!categories.length) {
      const defaults = [
        { name: "Breakfast", slug: "breakfast" },
        { name: "Sandwiches", slug: "sandwiches" },
        { name: "Rolls", slug: "rolls" },
        { name: "Shawarma", slug: "shawarma" },
        { name: "Tea", slug: "tea" },
        { name: "Behind the scenes", slug: "behind-the-scenes" },
        { name: "General", slug: "general" },
      ];
      await GalleryCategory.insertMany(
        defaults.map((d, i) => ({ ...d, displayOrder: i, isActive: true }))
      );
      const seeded = await GalleryCategory.find().sort({ displayOrder: 1 }).lean();
      return NextResponse.json(
        serialize({
          categories: seeded.map((c) => ({ ...c, imageCount: 0 })),
        })
      );
    }

    return NextResponse.json(serialize({ categories: withCounts }));
  } catch (error) {
    console.error("GET /api/gallery/categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
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
    const slug = parsed.data.slug || slugify(parsed.data.name);
    const cat = await GalleryCategory.create({ ...parsed.data, slug });
    return NextResponse.json(serialize(cat.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/gallery/categories:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

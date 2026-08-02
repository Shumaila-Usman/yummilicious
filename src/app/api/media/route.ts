import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MediaAsset } from "@/models/MediaAsset";
import { deleteImage } from "@/lib/cloudinary";
import { parsePagination, serialize } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = {};
    const folder = searchParams.get("folder");
    if (folder) filter.folder = folder;

    const tag = searchParams.get("tag");
    if (tag) filter.tags = tag;

    const [assets, total] = await Promise.all([
      MediaAsset.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MediaAsset.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        assets,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/media:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Media id is required" }, { status: 400 });
    }

    await connectDB();
    const asset = await MediaAsset.findById(id);
    if (!asset) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (asset.publicId) {
      try {
        await deleteImage(asset.publicId);
      } catch {
        // Continue even if Cloudinary delete fails
      }
    }

    await MediaAsset.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/media:", err);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}

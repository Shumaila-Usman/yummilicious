import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadImage } from "@/lib/cloudinary";
import { MediaAsset } from "@/models/MediaAsset";
import { serialize } from "@/lib/api/helpers";

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "yummilicious";
    const alt = (formData.get("alt") as string) || "";
    const tags = ((formData.get("tags") as string) || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isCloudinaryConfigured()) {
      const placeholder = {
        url: `/uploads/placeholder/${encodeURIComponent(file.name)}`,
        publicId: undefined,
        width: 800,
        height: 600,
        format: file.type.split("/")[1] || "jpg",
        bytes: buffer.length,
        placeholder: true,
        message: "Cloudinary not configured. Using placeholder URL.",
      };

      await connectDB();
      const asset = await MediaAsset.create({
        url: placeholder.url,
        filename: file.name,
        format: placeholder.format,
        width: placeholder.width,
        height: placeholder.height,
        bytes: placeholder.bytes,
        folder,
        alt,
        tags,
        usedIn: [],
      });

      return NextResponse.json(serialize({ ...placeholder, id: asset._id.toString() }), {
        status: 201,
      });
    }

    const result = await uploadImage(buffer, folder, file.name.replace(/\.[^.]+$/, ""));

    await connectDB();
    const asset = await MediaAsset.create({
      url: result.url,
      publicId: result.publicId,
      filename: file.name,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      folder,
      alt,
      tags,
      usedIn: [],
    });

    return NextResponse.json(
      serialize({
        id: asset._id.toString(),
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/upload:", err);
    return NextResponse.json(
      { error: "Upload failed. Check Cloudinary configuration and try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteStoredUploadByUrl, saveStoredUpload } from "@/lib/uploads/stored";
import { MediaAsset } from "@/models/MediaAsset";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folderRaw = (formData.get("folder") as string) || "misc";
    const replaceUrl = (formData.get("replaceUrl") as string) || "";
    const alt = (formData.get("alt") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveStoredUpload({
      buffer,
      mimeType: file.type || "image/jpeg",
      folder: folderRaw,
    });

    // Best-effort: remove previous Mongo upload when replacing
    if (replaceUrl.startsWith("/api/uploads/")) {
      await deleteStoredUploadByUrl(replaceUrl).catch(() => false);
    }

    await connectDB();
    await MediaAsset.create({
      url: saved.url,
      filename: saved.filename,
      format: saved.filename.split(".").pop(),
      bytes: saved.size,
      folder: saved.folder,
      alt,
      tags: [],
      usedIn: [],
    }).catch(() => null);

    return NextResponse.json(
      {
        success: true,
        url: saved.url,
        filename: saved.filename,
        size: saved.size,
        folder: saved.folder,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/upload:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}

/** Delete a Mongo-stored upload by public URL: DELETE /api/upload?url=/api/uploads/... */
export async function DELETE(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const url = request.nextUrl.searchParams.get("url") || "";
    if (!url.startsWith("/api/uploads/")) {
      return NextResponse.json(
        { error: "Only Mongo-stored /api/uploads/ URLs can be deleted this way." },
        { status: 400 }
      );
    }
    const deleted = await deleteStoredUploadByUrl(url);
    await connectDB();
    await MediaAsset.deleteMany({ url }).catch(() => null);
    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error("DELETE /api/upload:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

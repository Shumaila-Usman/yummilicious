import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { StoredUpload } from "@/models/StoredUpload";
import { UPLOAD_FOLDERS } from "@/lib/uploads/stored";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ folder: string; filename: string }> };

function sanitizeSegment(value: string, label: string) {
  if (!value || value.includes("..") || value.includes("/") || value.includes("\\")) {
    throw new Error(`Invalid ${label}`);
  }
  return value;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { folder: rawFolder, filename: rawFilename } = await params;
    const folder = sanitizeSegment(decodeURIComponent(rawFolder), "folder");
    const filename = sanitizeSegment(decodeURIComponent(rawFilename), "filename");

    if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).lean();
    if (!doc?.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = Buffer.isBuffer(doc.data)
      ? doc.data
      : Buffer.from(doc.data as unknown as ArrayBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Length": String(doc.size || body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("GET /api/uploads/[folder]/[filename]:", err);
    return NextResponse.json({ error: "Failed to load upload" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { folder: rawFolder, filename: rawFilename } = await params;
    const folder = sanitizeSegment(decodeURIComponent(rawFolder), "folder");
    const filename = sanitizeSegment(decodeURIComponent(rawFilename), "filename");

    await connectDB();
    const result = await StoredUpload.deleteOne({ folder, filename });
    return NextResponse.json({ success: true, deleted: result.deletedCount > 0 });
  } catch (err) {
    console.error("DELETE /api/uploads/[folder]/[filename]:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}

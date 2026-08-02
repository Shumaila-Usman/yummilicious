import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SiteContent } from "@/models/SiteContent";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const contentSchema = z.object({
  key: z.string().min(1),
  section: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const key = searchParams.get("key");
    const section = searchParams.get("section");

    const filter: Record<string, string> = {};
    if (key) filter.key = key;
    if (section) filter.section = section;

    const content = await SiteContent.find(filter).sort({ section: 1, key: 1 }).lean();

    if (key && content.length === 1) {
      return NextResponse.json(serialize(content[0]));
    }

    return NextResponse.json(serialize({ content }));
  } catch (error) {
    console.error("GET /api/content:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = contentSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const existing = await SiteContent.findOne({ key: parsed.data.key });
    if (existing) {
      return NextResponse.json({ error: "Content key already exists. Use PATCH to update." }, { status: 409 });
    }

    const content = await SiteContent.create(parsed.data);
    return NextResponse.json(serialize(content.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/content:", err);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = contentSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const content = await SiteContent.findOneAndUpdate(
      { key: parsed.data.key },
      { section: parsed.data.section, data: parsed.data.data },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return NextResponse.json(serialize(content));
  } catch (err) {
    console.error("PATCH /api/content:", err);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

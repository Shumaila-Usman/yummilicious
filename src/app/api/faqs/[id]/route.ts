import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Faq } from "@/models/Faq";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

const schema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
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
    const item = await Faq.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(serialize(item));
  } catch (err) {
    console.error("PATCH /api/faqs/[id]:", err);
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
    await Faq.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/faqs/[id]:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

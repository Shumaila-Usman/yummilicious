import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AddOn } from "@/models/AddOn";
import { addonSchema } from "@/lib/validations";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = addonSchema.partial().safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const addon = await AddOn.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!addon) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(addon));
  } catch (err) {
    console.error("PATCH /api/addons/[id]:", err);
    return NextResponse.json({ error: "Failed to update addon" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const addon = await AddOn.findByIdAndDelete(id);
    if (!addon) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/addons/[id]:", err);
    return NextResponse.json({ error: "Failed to delete addon" }, { status: 500 });
  }
}

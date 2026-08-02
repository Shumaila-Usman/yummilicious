import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations";
import { serialize, jsonValidationError } from "@/lib/api/helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate("categories", "name slug")
      .populate("addonIds")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(product));
  } catch (error) {
    console.error("GET /api/products/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const restore = request.nextUrl.searchParams.get("restore") === "true";

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (restore) {
      product.isDeleted = false;
      product.deletedAt = null;
      await product.save();
      return NextResponse.json(serialize(product.toObject()));
    }

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    Object.assign(product, parsed.data);
    await product.save();

    return NextResponse.json(serialize(product.toObject()));
  } catch (err) {
    console.error("PATCH /api/products/[id]:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(product.toObject()));
  } catch (err) {
    console.error("DELETE /api/products/[id]:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

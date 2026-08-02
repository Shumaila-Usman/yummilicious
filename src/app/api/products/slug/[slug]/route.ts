import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/api/helpers";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    await connectDB();

    const product = await Product.findOne({ slug, isDeleted: false })
      .populate("categories", "name slug description image")
      .populate({
        path: "addonIds",
        match: { isActive: true },
      })
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(product));
  } catch (error) {
    console.error("GET /api/products/slug/[slug]:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

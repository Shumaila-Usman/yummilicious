import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Product } from "@/models/Product";
import { productSchema } from "@/lib/validations";
import { slugifyText } from "@/lib/utils/format";
import { isSaleActive } from "@/lib/pricing/calculate";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";
function buildProductFilter(searchParams: URLSearchParams, admin = false) {
  const filter: Record<string, unknown> = admin ? {} : { isDeleted: false };

  const category = searchParams.get("category");
  if (category) {
    filter.categories = category;
  }

  const search = searchParams.get("search");
  if (search) {
    filter.$text = { $search: search };
  }

  if (searchParams.get("featured") === "true") {
    filter.isFeatured = true;
  }

  if (searchParams.get("available") === "true") {
    filter.isAvailable = true;
    filter.isSoldOut = false;
  }

  if (searchParams.get("vegetarian") === "true") {
    filter.dietaryTags = "vegetarian";
  }

  if (admin && searchParams.get("includeDeleted") === "true") {
    delete filter.isDeleted;
  }

  return filter;
}

function buildSort(searchParams: URLSearchParams): Record<string, 1 | -1> {
  const sort = searchParams.get("sort") || "displayOrder";
  switch (sort) {
    case "price-asc":
      return { basePrice: 1 };
    case "price-desc":
      return { basePrice: -1 };
    case "name":
      return { name: 1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { displayOrder: 1, name: 1 };
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const adminView = searchParams.get("admin") === "true";

    const filter = buildProductFilter(searchParams, adminView);
    const sort = buildSort(searchParams);
    const saleOnly = searchParams.get("sale") === "true";

    let products = await Product.find(filter)
      .populate("categories", "name slug")
      .sort(sort)
      .lean();

    if (saleOnly) {
      products = products.filter((p) => isSaleActive(p.sale));
    }

    const total = products.length;
    const paginated = products.slice(skip, skip + limit);

    return NextResponse.json(
      serialize({
        products: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("GET /api/products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();

    let slug = slugifyText(parsed.data.name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await Product.create({
      ...parsed.data,
      slug,
      sale: parsed.data.sale ?? { enabled: false, type: "percentage", value: 0 },
      inventory: parsed.data.inventory ?? { track: false, quantity: 0, lowStockThreshold: 5 },
    });

    return NextResponse.json(serialize(product.toObject()), { status: 201 });
  } catch (err) {
    console.error("POST /api/products:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

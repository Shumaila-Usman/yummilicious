import type { StoreProduct, StoreCategory, StoreAddon } from "@/lib/data/fallback";
import { FALLBACK_PRODUCTS, FALLBACK_CATEGORIES, FALLBACK_ADDONS } from "@/lib/data/fallback";
import { connectDB } from "@/lib/db/connect";
import { Product, Category, AddOn } from "@/models";

export function mapProduct(p: Record<string, unknown>): StoreProduct {
  const cats = (p.categories as Record<string, unknown>[] | undefined)?.map((c) => ({
    _id: String(c._id),
    name: String(c.name),
    slug: String(c.slug),
  })) ?? [];
  return {
    _id: String(p._id),
    name: String(p.name),
    slug: String(p.slug),
    shortDescription: String(p.shortDescription),
    fullDescription: String(p.fullDescription),
    categories: cats,
    basePrice: Number(p.basePrice),
    variants: (p.variants as StoreProduct["variants"]) ?? [],
    options: (p.options as StoreProduct["options"]) ?? [],
    addonIds: ((p.addonIds as unknown[]) ?? []).map(String),
    images: (p.images as StoreProduct["images"]) ?? [],
    featuredImage: p.featuredImage as string | undefined,
    ingredients: (p.ingredients as string[]) ?? [],
    dietaryTags: (p.dietaryTags as StoreProduct["dietaryTags"]) ?? [],
    includes: p.includes as string[] | undefined,
    isFeatured: Boolean(p.isFeatured),
    isAvailable: Boolean(p.isAvailable),
    isSoldOut: Boolean(p.isSoldOut),
    preparationTime: p.preparationTime as number | undefined,
    sale: (p.sale as StoreProduct["sale"]) ?? { enabled: false, type: "percentage", value: 0 },
    seoTitle: p.seoTitle as string | undefined,
    seoDescription: p.seoDescription as string | undefined,
    displayOrder: Number(p.displayOrder ?? 0),
  };
}

export async function fetchProducts(filter: Record<string, unknown> = {}): Promise<StoreProduct[]> {
  try {
    await connectDB();
    const products = await Product.find({ isDeleted: false, isAvailable: true, ...filter })
      .populate("categories", "name slug")
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    if (products.length) return products.map((p) => mapProduct(p as Record<string, unknown>));
  } catch {
    /* no DB */
  }
  return FALLBACK_PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<StoreProduct | null> {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, isDeleted: false })
      .populate("categories", "name slug")
      .lean();
    if (product) return mapProduct(product as Record<string, unknown>);
  } catch {
    /* no DB */
  }
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function fetchCategories(): Promise<StoreCategory[]> {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    if (categories.length) {
      return categories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        icon: c.icon,
        displayOrder: c.displayOrder,
      }));
    }
  } catch {
    /* no DB */
  }
  return FALLBACK_CATEGORIES;
}

export async function fetchCategoryBySlug(slug: string): Promise<StoreCategory | null> {
  const categories = await fetchCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

function mapAddon(a: Record<string, unknown>): StoreAddon {
  return {
    _id: String(a._id),
    name: String(a.name),
    slug: String(a.slug ?? ""),
    description: a.description as string | undefined,
    price: Number(a.price),
    size: a.size as string | undefined,
    maxQuantity: Number(a.maxQuantity ?? 5),
    displayOrder: Number(a.displayOrder ?? 0),
  };
}

/** Global add-ons shown on every menu item (dips + soft drinks). */
export async function fetchActiveAddons(): Promise<StoreAddon[]> {
  try {
    await connectDB();
    const addons = await AddOn.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    if (addons.length) return addons.map((a) => mapAddon(a as Record<string, unknown>));
  } catch {
    /* no DB */
  }
  return FALLBACK_ADDONS;
}

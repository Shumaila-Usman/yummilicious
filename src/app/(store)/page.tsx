import { connectDB } from "@/lib/db/connect";
import { Product, Category, Settings } from "@/models";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StorySection } from "@/components/home/StorySection";
import { BreakfastSpotlight } from "@/components/home/BreakfastSpotlight";
import { RollShawarmaSection } from "@/components/home/RollShawarmaSection";
import { BreakfastDeals } from "@/components/home/BreakfastDeals";
import { WhyChoose } from "@/components/home/WhyChoose";
import { Reviews } from "@/components/home/Reviews";
import { FinalCTA } from "@/components/home/FinalCTA";
import { CravingBanner } from "@/components/home/CravingBanner";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_CATEGORIES,
  FALLBACK_REVIEWS,
  type StoreProduct,
  type StoreCategory,
} from "@/lib/data/fallback";
import { getPage, getSiteContact } from "@/lib/cms/get-page";
import { fieldMap } from "@/lib/cms/default-pages";

/** Always read fresh CMS content from MongoDB (admin edits must show immediately). */
export const dynamic = "force-dynamic";

function mapProduct(p: Record<string, unknown>): StoreProduct {
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

async function getHomeData() {
  let products: StoreProduct[] = FALLBACK_PRODUCTS;
  let categories: StoreCategory[] = FALLBACK_CATEGORIES;
  let reviews = FALLBACK_REVIEWS;

  try {
    await connectDB();
    const [dbProducts, dbCategories, settings] = await Promise.all([
      Product.find({ isDeleted: false, isAvailable: true })
        .populate("categories", "name slug")
        .sort({ displayOrder: 1, isFeatured: -1 })
        .limit(12)
        .lean(),
      Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
      Settings.findOne().lean(),
    ]);

    if (dbProducts.length) products = dbProducts.map((p) => mapProduct(p as Record<string, unknown>));
    if (dbCategories.length) {
      categories = dbCategories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        icon: c.icon,
        displayOrder: c.displayOrder,
      }));
    }
    if (settings?.reviews?.length) reviews = settings.reviews;
  } catch {
    /* build without DB */
  }

  return { products, categories, reviews };
}

export default async function HomePage() {
  const [{ products, reviews }, page, contact] = await Promise.all([
    getHomeData(),
    getPage("home"),
    getSiteContact(),
  ]);

  const hero = fieldMap(page.sections, "hero");
  const story = fieldMap(page.sections, "story");
  const why = fieldMap(page.sections, "why");
  const cta = fieldMap(page.sections, "cta");

  return (
    <>
      <Hero content={hero} />
      <FeaturedProducts products={products} />
      <StorySection content={story} />
      <BreakfastSpotlight products={products} />
      <RollShawarmaSection products={products} />
      <BreakfastDeals products={products} />
      <WhyChoose content={why} />
      <Reviews reviews={reviews} />
      <FinalCTA content={cta} whatsapp={contact.whatsapp} />
      <CravingBanner />
    </>
  );
}

/**
 * Non-destructive catalog load: upserts categories, add-ons, products, settings.
 * Does NOT delete any existing documents.
 *
 * Usage: npx tsx scripts/upsert-catalog.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const full = resolve(process.cwd(), file);
    if (!existsSync(full)) continue;
    for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFiles();

async function upsertCatalog() {
  loadEnvFiles();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required — check .env.local");

  const mongoose = (await import("mongoose")).default;
  const { connectDB } = await import("../src/lib/db/connect");
  const { Category, Product, AddOn, Settings } = await import("../src/models");
  const {
    FALLBACK_CATEGORIES,
    FALLBACK_PRODUCTS,
    FALLBACK_ADDONS,
    FALLBACK_SETTINGS,
    WRAP_ADDON_PRODUCT_SLUGS,
    WRAP_ADDONS,
    BREAKFAST_ADDONS,
    CONTACT,
  } = await import("../src/lib/data/fallback");

  await connectDB();
  console.log("Upserting catalog (no deletes)…");

  for (const cat of FALLBACK_CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          icon: cat.icon,
          displayOrder: cat.displayOrder,
          isActive: true,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }
  const catDocs = await Category.find({
    slug: { $in: FALLBACK_CATEGORIES.map((c) => c.slug) },
  }).lean();
  const catIdBySlug = Object.fromEntries(catDocs.map((c) => [c.slug, c._id]));
  console.log(`Categories upserted: ${FALLBACK_CATEGORIES.length}`);

  for (const addon of FALLBACK_ADDONS) {
    await AddOn.updateOne(
      { slug: addon.slug },
      {
        $set: {
          name: addon.name,
          slug: addon.slug,
          description: addon.description,
          price: addon.price,
          size: addon.size,
          maxQuantity: addon.maxQuantity,
          displayOrder: addon.displayOrder,
          isActive: true,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }
  const addonDocs = await AddOn.find({
    slug: { $in: FALLBACK_ADDONS.map((a) => a.slug) },
  }).lean();
  const addonIdBySlug = Object.fromEntries(addonDocs.map((a) => [a.slug, a._id]));
  console.log(`Add-ons upserted: ${FALLBACK_ADDONS.length}`);

  const wrapAddonIds = WRAP_ADDONS.map((a) => addonIdBySlug[a.slug]).filter(Boolean);
  const breakfastAddonIds = BREAKFAST_ADDONS.map((a) => addonIdBySlug[a.slug]).filter(
    Boolean
  );
  const wrapSlugs = new Set(WRAP_ADDON_PRODUCT_SLUGS);

  for (const p of FALLBACK_PRODUCTS) {
    const categoryIds = p.categories
      .map((c) => catIdBySlug[c.slug])
      .filter(Boolean);

    const addonIds = [];
    if (wrapSlugs.has(p.slug)) addonIds.push(...wrapAddonIds);
    if (p.categories.some((c) => c.slug === "breakfast")) {
      addonIds.push(...breakfastAddonIds);
    }

    await Product.updateOne(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          categories: categoryIds,
          basePrice: p.basePrice,
          variants: (p.variants ?? []).map((v) => ({
            name: v.name,
            price: v.price,
            originalPrice: v.originalPrice,
            isDefault: v.isDefault ?? false,
            isAvailable: v.isAvailable !== false,
          })),
          options: p.options ?? [],
          addonIds,
          images: p.images ?? [],
          featuredImage: p.featuredImage,
          ingredients: p.ingredients ?? [],
          dietaryTags: p.dietaryTags ?? [],
          includes: p.includes,
          isFeatured: p.isFeatured,
          isAvailable: true,
          isSoldOut: false,
          isDeleted: false,
          deletedAt: null,
          preparationTime: p.preparationTime,
          displayOrder: p.displayOrder,
          sale: p.sale ?? {
            enabled: false,
            type: "percentage",
            value: 0,
            showBadge: true,
          },
          inventory: { track: false, quantity: 100, lowStockThreshold: 5 },
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }
  console.log(`Products upserted: ${FALLBACK_PRODUCTS.length}`);

  const products = await Product.find({
    slug: { $in: FALLBACK_PRODUCTS.map((p) => p.slug) },
    isDeleted: false,
  }).lean();

  for (const addon of addonDocs) {
    const applicable = products
      .filter((p) =>
        (p.addonIds ?? []).some((id) => String(id) === String(addon._id))
      )
      .map((p) => p._id);
    await AddOn.updateOne(
      { _id: addon._id },
      { $set: { applicableProducts: applicable, applicableCategories: [] } }
    );
  }

  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({
      brandName: FALLBACK_SETTINGS.brandName,
      tagline: FALLBACK_SETTINGS.tagline,
      supportingLine: FALLBACK_SETTINGS.supportingLine,
      phone: CONTACT.phone,
      email: CONTACT.email,
      whatsappNumber: CONTACT.whatsapp,
      address: "Islamabad, Pakistan",
      city: "Islamabad",
      deliveryFee: FALLBACK_SETTINGS.deliveryFee,
      freeDeliveryMin: FALLBACK_SETTINGS.freeDeliveryMin,
      minimumOrderValue: FALLBACK_SETTINGS.minimumOrderValue,
      businessHours: FALLBACK_SETTINGS.businessHours,
      announcementBar: {
        enabled: true,
        text: "Ordering windows: 9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM · Fresh homemade flavour daily",
      },
    });
    console.log("Settings created (was empty)");
  } else {
    console.log(`Settings left unchanged (${settingsCount} doc(s))`);
  }

  console.log("✅ Upsert complete — nothing deleted");
  console.log({
    categories: await Category.countDocuments({ isActive: true }),
    products: await Product.countDocuments({ isDeleted: false }),
    addons: await AddOn.countDocuments({ isActive: true }),
  });
  console.log("Sample prices:");
  for (const slug of ["egg-sandwich", "chicken-shawarma", "breakfast-deal-1", "pepsi"]) {
    const doc = await Product.findOne({ slug }).select("name basePrice").lean();
    if (doc) console.log(`  ${doc.name}: PKR ${doc.basePrice}`);
  }

  await mongoose.disconnect();
}

upsertCatalog().catch((err) => {
  console.error(err);
  process.exit(1);
});

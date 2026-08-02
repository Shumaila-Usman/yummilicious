import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Load .env.local / .env when not injected by the shell
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

import { connectDB } from "../src/lib/db/connect";
import {
  Admin,
  Category,
  Product,
  AddOn,
  Settings,
  SiteContent,
  GalleryImage,
} from "../src/models";

const FOOD = {
  eggSandwich: "/products/egg-sandwich.png",
  frenchToast: "/products/french-toast.png",
  paratha: "/products/paratha.png",
  friedEgg: "/products/fried-egg.png",
  anddaGhotala: "/products/andda-ghotala.png",
  shamiEgg: "/products/chicken-shami-egg-sandwich.png",
  shawarma: "/products/chicken-shawarma.jpg",
  chickenRoll: "/products/chicken-roll-paratha.png",
  malaiBoti: "/products/malai-boti-roll-paratha.png",
  deal1: "/products/breakfast-deal-1.png",
  deal2: "/products/breakfast-deal-2.png",
  deal3: "/products/breakfast-deal-3.jpg",
  deal4: "/products/breakfast-deal-4.jpg",
  specialTea: "/products/special-tea.png",
  cardamomTea: "/products/cardamom-tea.jpg",
  pepsi: "/products/pepsi.jpg",
  coke: "/products/coke.png",
  shawarmaDip: "/products/shawarma-dip.png",
  spicyMayoDip: "/products/spicy-mayo-dip.png",
  cuminYogurtDip: "/products/cumin-yogurt-dip.png",
  // site content / gallery fallbacks from product set
  hero: "/images/hero/hero-bg.png",
  cooking: "/products/andda-ghotala.png",
  dough: "/products/paratha.png",
  plate: "/products/breakfast-deal-1.png",
};

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  await connectDB();
  console.log("Connected. Seeding…");

  await Promise.all([
    Admin.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    AddOn.deleteMany({}),
    Settings.deleteMany({}),
    SiteContent.deleteMany({}),
    GalleryImage.deleteMany({}),
  ]);

  const email = process.env.ADMIN_EMAIL || "admin@yummilicious.com";
  const password = process.env.ADMIN_PASSWORD || "YummiAdmin@123";
  const hashed = await bcrypt.hash(password, 12);

  await Admin.create({
    name: "Yummilicious Admin",
    email,
    password: hashed,
    role: "superadmin",
  });

  const cats = await Category.insertMany([
    { name: "Breakfast", slug: "breakfast", description: "Warm morning favourites", displayOrder: 1, image: FOOD.anddaGhotala },
    { name: "Sandwiches", slug: "sandwiches", description: "Hearty homemade sandwiches", displayOrder: 2, image: FOOD.eggSandwich },
    { name: "Shawarma", slug: "shawarma", description: "Spiced grilled wraps", displayOrder: 3, image: FOOD.shawarma },
    { name: "Roll Parathas", slug: "roll-parathas", description: "Generously filled roll parathas", displayOrder: 4, image: FOOD.chickenRoll },
    { name: "Dips", slug: "dips", description: "Signature sauces & dips", displayOrder: 5, image: FOOD.shawarmaDip },
    { name: "Breakfast Deals", slug: "breakfast-deals", description: "Complete morning combos", displayOrder: 6, image: FOOD.deal1 },
    { name: "Tea", slug: "tea", description: "Comforting cups of chai", displayOrder: 7, image: FOOD.specialTea },
    { name: "Beverages", slug: "beverages", description: "Chilled drinks", displayOrder: 8, image: FOOD.pepsi },
  ]);

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

  const addons = await AddOn.insertMany([
    {
      name: "Shawarma Dip (30ml)",
      slug: "shawarma-dip-30ml",
      description: "Our signature shawarma sauce",
      price: 40,
      size: "30 ml",
      maxQuantity: 5,
      displayOrder: 1,
    },
    {
      name: "Shawarma Dip (85ml)",
      slug: "shawarma-dip-85ml",
      description: "Our signature shawarma sauce — larger cup",
      price: 90,
      size: "85 ml",
      maxQuantity: 5,
      displayOrder: 2,
    },
    {
      name: "Spicy Mayo Dip (30ml)",
      slug: "spicy-mayo-dip-30ml",
      description: "Creamy spicy mayo",
      price: 40,
      size: "30 ml",
      maxQuantity: 5,
      displayOrder: 3,
    },
    {
      name: "Spicy Mayo Dip (85ml)",
      slug: "spicy-mayo-dip-85ml",
      description: "Creamy spicy mayo — larger cup",
      price: 90,
      size: "85 ml",
      maxQuantity: 5,
      displayOrder: 4,
    },
    {
      name: "Cumin Yogurt Dip (30ml)",
      slug: "cumin-yogurt-dip-30ml",
      description: "Cool cumin yogurt",
      price: 40,
      size: "30 ml",
      maxQuantity: 5,
      displayOrder: 5,
    },
    {
      name: "Cumin Yogurt Dip (85ml)",
      slug: "cumin-yogurt-dip-85ml",
      description: "Cool cumin yogurt — larger cup",
      price: 90,
      size: "85 ml",
      maxQuantity: 5,
      displayOrder: 6,
    },
    {
      name: "Pepsi 345ml",
      slug: "pepsi-345ml",
      description: "Refreshing Pepsi 345 ml bottle",
      price: 70,
      size: "345 ml",
      maxQuantity: 5,
      displayOrder: 7,
    },
    {
      name: "Coke 350ml",
      slug: "coke-350ml",
      description: "Refreshing Coke 350 ml bottle",
      price: 80,
      size: "350 ml",
      maxQuantity: 5,
      displayOrder: 8,
    },
    {
      name: "Chai (Special Tea)",
      slug: "chai-special-tea",
      description: "Warm special chai with separate sugar",
      price: 200,
      size: "180 ml",
      maxQuantity: 5,
      displayOrder: 9,
    },
    {
      name: "Cinnamon Tea",
      slug: "cinnamon-tea",
      description: "Fragrant cinnamon tea",
      price: 210,
      size: "180 ml",
      maxQuantity: 5,
      displayOrder: 10,
    },
  ]);

  const addonBySlug = Object.fromEntries(addons.map((a) => [a.slug, a._id]));
  const wrapAddonIds = [
    "shawarma-dip-30ml",
    "shawarma-dip-85ml",
    "spicy-mayo-dip-30ml",
    "spicy-mayo-dip-85ml",
    "cumin-yogurt-dip-30ml",
    "cumin-yogurt-dip-85ml",
    "pepsi-345ml",
    "coke-350ml",
  ].map((s) => addonBySlug[s]);
  const breakfastAddonIds = ["chai-special-tea", "cinnamon-tea"].map(
    (s) => addonBySlug[s]
  );
  const WRAP_PRODUCT_SLUGS = new Set([
    "chicken-shawarma",
    "chicken-roll-paratha",
    "malai-boti-roll-paratha",
    "andda-ghotala",
  ]);
  function addonIdsFor(
    slug: string,
    categoryIds: (typeof cats)[number]["_id"][]
  ) {
    const ids = [];
    if (WRAP_PRODUCT_SLUGS.has(slug)) ids.push(...wrapAddonIds);
    if (categoryIds.some((id) => String(id) === String(bySlug.breakfast))) {
      ids.push(...breakfastAddonIds);
    }
    return ids;
  }

  const yolkOption = {
    name: "Yolk Preference",
    required: true,
    type: "single" as const,
    choices: [
      { label: "Half-done yolk", priceModifier: 0 },
      { label: "Fully cooked yolk", priceModifier: 0 },
    ],
  };

  const dualEggOptions = [
    {
      name: "Egg 1 Yolk Preference",
      required: true,
      type: "single" as const,
      choices: [
        { label: "Half-done yolk", priceModifier: 0 },
        { label: "Fully cooked yolk", priceModifier: 0 },
      ],
    },
    {
      name: "Egg 2 Yolk Preference",
      required: true,
      type: "single" as const,
      choices: [
        { label: "Half-done yolk", priceModifier: 0 },
        { label: "Fully cooked yolk", priceModifier: 0 },
      ],
    },
  ];

  const products = [
    {
      name: "Egg Sandwich",
      slug: "egg-sandwich",
      shortDescription:
        "Fluffy scrambled eggs nestled between toasted bread with some sauces. A hearty breakfast sandwich perfect for starting your day.",
      fullDescription:
        "Fluffy scrambled eggs nestled between toasted bread with some sauces. A hearty breakfast sandwich perfect for starting your day.",
      categories: [bySlug.sandwiches, bySlug.breakfast],
      basePrice: 400,
      featuredImage: FOOD.eggSandwich,
      images: [{ url: FOOD.eggSandwich, alt: "Egg Sandwich", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: true,
      displayOrder: 1,
      preparationTime: 15,
    },
    {
      name: "French Toast",
      slug: "french-toast",
      shortDescription:
        "Soft and fresh French toast served with delicious chocolate sauce for a delightful breakfast experience.",
      fullDescription:
        "Soft and fresh French toast served with delicious chocolate sauce for a delightful breakfast experience.",
      categories: [bySlug.breakfast],
      basePrice: 360,
      variants: [
        { name: "2 pieces", price: 360, isDefault: true },
        { name: "3 pieces", price: 420 },
      ],
      featuredImage: FOOD.frenchToast,
      images: [{ url: FOOD.frenchToast, alt: "French Toast", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: true,
      displayOrder: 2,
      preparationTime: 15,
    },
    {
      name: "Paratha",
      slug: "paratha",
      shortDescription:
        "A flaky pan-fried flatbread made from layered flour dough cooked until golden and crispy.",
      fullDescription:
        "A flaky pan-fried flatbread made from layered flour dough cooked until golden and crispy.",
      categories: [bySlug.breakfast],
      basePrice: 250,
      variants: [
        { name: "Refined flour paratha", price: 250, isDefault: true },
        { name: "Whole wheat flour paratha", price: 280 },
      ],
      featuredImage: FOOD.paratha,
      images: [{ url: FOOD.paratha, alt: "Paratha", order: 0 }],
      dietaryTags: ["vegetarian"],
      isFeatured: true,
      displayOrder: 3,
      preparationTime: 12,
    },
    {
      name: "Fried Egg",
      slug: "fried-egg",
      shortDescription: "A cooked egg with firm white and a runny or set yolk.",
      fullDescription: "A cooked egg with firm white and a runny or set yolk.",
      categories: [bySlug.breakfast],
      basePrice: 250,
      options: [yolkOption],
      featuredImage: FOOD.friedEgg,
      images: [{ url: FOOD.friedEgg, alt: "Fried Egg", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: false,
      displayOrder: 4,
      preparationTime: 8,
    },
    {
      name: "Andda Ghotala",
      slug: "andda-ghotala",
      shortDescription: "A fluffy egg cooked with mixed vegetables and some spices.",
      fullDescription: "A fluffy egg cooked with mixed vegetables and some spices.",
      categories: [bySlug.breakfast],
      basePrice: 350,
      featuredImage: FOOD.anddaGhotala,
      images: [{ url: FOOD.anddaGhotala, alt: "Andda Ghotala", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: true,
      displayOrder: 5,
      preparationTime: 15,
    },
    {
      name: "Chicken Shami Egg Sandwich",
      slug: "chicken-shami-egg-sandwich",
      shortDescription:
        "Delicious chicken shami patty combined with a fluffy fried egg served between soft bread slices. A hearty breakfast sandwich perfect for starting your day.",
      fullDescription:
        "Delicious chicken shami patty combined with a fluffy fried egg served between soft bread slices. A hearty breakfast sandwich perfect for starting your day.",
      categories: [bySlug.sandwiches, bySlug.breakfast],
      basePrice: 450,
      featuredImage: FOOD.shamiEgg,
      images: [{ url: FOOD.shamiEgg, alt: "Chicken Shami Egg Sandwich", order: 0 }],
      dietaryTags: ["contains-egg", "non-vegetarian"],
      isFeatured: true,
      displayOrder: 6,
      preparationTime: 18,
    },
    {
      name: "Chicken Shawarma",
      slug: "chicken-shawarma",
      shortDescription:
        "Thinly sliced and spiced grilled chicken wrapped in pita bread served with special sauce and vegetables.",
      fullDescription:
        "Thinly sliced and spiced grilled chicken wrapped in pita bread served with special sauce and vegetables.",
      categories: [bySlug.shawarma],
      basePrice: 400,
      variants: [
        { name: "Medium", price: 400, isDefault: true },
        { name: "Extra Large", price: 700 },
      ],
      featuredImage: FOOD.shawarma,
      images: [{ url: FOOD.shawarma, alt: "Chicken Shawarma", order: 0 }],
      dietaryTags: ["non-vegetarian"],
      isFeatured: true,
      displayOrder: 7,
      preparationTime: 20,
    },
    {
      name: "Chicken Roll Paratha",
      slug: "chicken-roll-paratha",
      shortDescription:
        "Tender smoked chicken pieces wrapped in a soft warm paratha with fresh salad and flavorful sauces for a satisfying meal.",
      fullDescription:
        "Tender smoked chicken pieces wrapped in a soft warm paratha with fresh salad and flavorful sauces for a satisfying meal.",
      categories: [bySlug["roll-parathas"]],
      basePrice: 450,
      variants: [
        { name: "Small (6 inches)", price: 450, isDefault: true },
        { name: "Regular (8 inches)", price: 550 },
        { name: "Large (12 inches)", price: 750 },
        { name: "Extra Large (16 inches)", price: 950 },
      ],
      featuredImage: FOOD.chickenRoll,
      images: [{ url: FOOD.chickenRoll, alt: "Chicken Roll Paratha", order: 0 }],
      dietaryTags: ["non-vegetarian"],
      isFeatured: true,
      displayOrder: 8,
      preparationTime: 22,
    },
    {
      name: "Malai Boti Roll Paratha",
      slug: "malai-boti-roll-paratha",
      shortDescription:
        "Tender malai boti wrapped in a large paratha roll along with some sauces.",
      fullDescription:
        "Tender malai boti wrapped in a large paratha roll along with some sauces.",
      categories: [bySlug["roll-parathas"]],
      basePrice: 450,
      variants: [
        { name: "Small (6 inches)", price: 450, isDefault: true },
        { name: "Regular (8 inches)", price: 550 },
        { name: "Large (12 inches)", price: 750 },
        { name: "Extra Large (16 inches)", price: 950 },
      ],
      featuredImage: FOOD.malaiBoti,
      images: [{ url: FOOD.malaiBoti, alt: "Malai Boti Roll Paratha", order: 0 }],
      dietaryTags: ["non-vegetarian"],
      isFeatured: true,
      displayOrder: 9,
      preparationTime: 22,
    },
    {
      name: "Breakfast Deal 1",
      slug: "breakfast-deal-1",
      shortDescription:
        "Refined flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
      fullDescription:
        "Refined flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
      categories: [bySlug["breakfast-deals"], bySlug.breakfast],
      basePrice: 650,
      includes: [
        "Refined flour paratha",
        "Andda Ghotala",
        "Special tea (180 ml)",
        "Sugar served separately",
      ],
      featuredImage: FOOD.deal1,
      images: [{ url: FOOD.deal1, alt: "Breakfast Deal 1", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: true,
      displayOrder: 10,
      preparationTime: 25,
    },
    {
      name: "Breakfast Deal 2",
      slug: "breakfast-deal-2",
      shortDescription:
        "Whole flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
      fullDescription:
        "Whole flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
      categories: [bySlug["breakfast-deals"], bySlug.breakfast],
      basePrice: 680,
      includes: [
        "Whole flour paratha",
        "Andda Ghotala",
        "Special tea (180 ml)",
        "Sugar served separately",
      ],
      featuredImage: FOOD.deal2,
      images: [{ url: FOOD.deal2, alt: "Breakfast Deal 2", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: false,
      displayOrder: 11,
      preparationTime: 25,
    },
    {
      name: "Breakfast Deal 3",
      slug: "breakfast-deal-3",
      shortDescription:
        "Refined flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
      fullDescription:
        "Refined flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
      categories: [bySlug["breakfast-deals"], bySlug.breakfast],
      basePrice: 700,
      options: dualEggOptions,
      includes: [
        "Refined flour paratha",
        "Two fried eggs",
        "Special tea (180 ml)",
        "Sugar served separately",
      ],
      featuredImage: FOOD.deal3,
      images: [{ url: FOOD.deal3, alt: "Breakfast Deal 3", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: false,
      displayOrder: 12,
      preparationTime: 25,
    },
    {
      name: "Breakfast Deal 4",
      slug: "breakfast-deal-4",
      shortDescription:
        "Whole wheat flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
      fullDescription:
        "Whole wheat flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
      categories: [bySlug["breakfast-deals"], bySlug.breakfast],
      basePrice: 730,
      options: dualEggOptions,
      includes: [
        "Whole wheat flour paratha",
        "Two fried eggs",
        "Special tea (180 ml)",
        "Sugar served separately",
      ],
      featuredImage: FOOD.deal4,
      images: [{ url: FOOD.deal4, alt: "Breakfast Deal 4", order: 0 }],
      dietaryTags: ["contains-egg", "vegetarian"],
      isFeatured: false,
      displayOrder: 13,
      preparationTime: 25,
    },
    {
      name: "Special Tea",
      slug: "special-tea",
      shortDescription:
        "A warm beverage made by mixing tea with milk provided with separate sugar.",
      fullDescription:
        "A warm beverage made by mixing tea with milk provided with separate sugar.",
      categories: [bySlug.tea],
      basePrice: 300,
      variants: [
        { name: "180 ml", price: 300, isDefault: true },
        { name: "250 ml", price: 350 },
      ],
      featuredImage: FOOD.specialTea,
      images: [{ url: FOOD.specialTea, alt: "Special Tea", order: 0 }],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 14,
      preparationTime: 8,
    },
    {
      name: "Cardamom Tea",
      slug: "cardamom-tea",
      shortDescription: "A fragrant beverage made by brewing tea with cardamom pods.",
      fullDescription: "A fragrant beverage made by brewing tea with cardamom pods.",
      categories: [bySlug.tea],
      basePrice: 310,
      variants: [
        { name: "180 ml", price: 310, isDefault: true },
        { name: "250 ml", price: 360 },
      ],
      featuredImage: FOOD.cardamomTea,
      images: [{ url: FOOD.cardamomTea, alt: "Cardamom Tea", order: 0 }],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 15,
      preparationTime: 8,
    },
    {
      name: "Pepsi 345ml",
      slug: "pepsi",
      shortDescription:
        "Refreshing Pepsi beverage in a convenient 345 ml bottle perfect for any occasion.",
      fullDescription:
        "Refreshing Pepsi beverage in a convenient 345 ml bottle perfect for any occasion.",
      categories: [bySlug.beverages],
      basePrice: 170,
      featuredImage: FOOD.pepsi,
      images: [{ url: FOOD.pepsi, alt: "Pepsi 345 ml", order: 0 }],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 16,
      preparationTime: 2,
    },
    {
      name: "Coke 350ml",
      slug: "coke",
      shortDescription:
        "Refreshing Coke in a convenient 350 ml bottle. Crisp carbonated cola with a classic taste perfect for any occasion.",
      fullDescription:
        "Refreshing Coke in a convenient 350 ml bottle. Crisp carbonated cola with a classic taste perfect for any occasion.",
      categories: [bySlug.beverages],
      basePrice: 180,
      featuredImage: FOOD.coke,
      images: [{ url: FOOD.coke, alt: "Coke 350 ml", order: 0 }],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 17,
      preparationTime: 2,
    },
    {
      name: "Shawarma Dip",
      slug: "shawarma-dip",
      shortDescription: "Our signature shawarma sauce — choose your cup size.",
      fullDescription:
        "Our signature shawarma sauce, perfect with wraps and rolls. Choose 30 ml or 85 ml.",
      categories: [bySlug.dips],
      basePrice: 140,
      variants: [
        { name: "30 ml", price: 140, isDefault: true },
        { name: "85 ml", price: 190 },
      ],
      featuredImage: FOOD.shawarmaDip,
      images: [
        {
          url: FOOD.shawarmaDip,
          alt: "Shawarma Dip",
          order: 0,
        },
      ],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 18,
      preparationTime: 2,
    },
    {
      name: "Spicy Mayo Dip",
      slug: "spicy-mayo-dip",
      shortDescription: "Creamy spicy mayo — choose your cup size.",
      fullDescription: "Creamy spicy mayo dip. Choose 30 ml or 85 ml.",
      categories: [bySlug.dips],
      basePrice: 140,
      variants: [
        { name: "30 ml", price: 140, isDefault: true },
        { name: "85 ml", price: 190 },
      ],
      featuredImage: FOOD.spicyMayoDip,
      images: [
        {
          url: FOOD.spicyMayoDip,
          alt: "Spicy Mayo Dip",
          order: 0,
        },
      ],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 19,
      preparationTime: 2,
    },
    {
      name: "Cumin Yogurt Dip",
      slug: "cumin-yogurt-dip",
      shortDescription: "Cool cumin yogurt — choose your cup size.",
      fullDescription: "Cool cumin yogurt dip. Choose 30 ml or 85 ml.",
      categories: [bySlug.dips],
      basePrice: 140,
      variants: [
        { name: "30 ml", price: 140, isDefault: true },
        { name: "85 ml", price: 190 },
      ],
      featuredImage: FOOD.cuminYogurtDip,
      images: [
        {
          url: FOOD.cuminYogurtDip,
          alt: "Cumin Yogurt Dip",
          order: 0,
        },
      ],
      dietaryTags: ["vegetarian"],
      isFeatured: false,
      displayOrder: 20,
      preparationTime: 2,
    },
  ];

  const productsWithAddons = products.map((p) => ({
    ...p,
    addonIds: addonIdsFor(p.slug, p.categories),
    isAvailable: true,
    isSoldOut: false,
    inventory: { track: false, quantity: 100, lowStockThreshold: 5 },
    sale: { enabled: false, type: "percentage", value: 0, showBadge: true },
  }));

  const created = await Product.insertMany(productsWithAddons);

  await Promise.all(
    addons.map((addon) =>
      AddOn.updateOne(
        { _id: addon._id },
        {
          $set: {
            applicableProducts: created
              .filter((_, i) =>
                productsWithAddons[i].addonIds.some(
                  (id) => String(id) === String(addon._id)
                )
              )
              .map((p) => p._id),
            applicableCategories: [],
          },
        }
      )
    )
  );

  await Settings.create({
    brandName: "Yummilicious",
    tagline: "Homemade Comfort. Unforgettable Flavour.",
    supportingLine:
      "Freshly prepared homemade favourites, made with care and delivered with flavour.",
    phone: "03369863734",
    email: "yummilicious321@gmail.com",
    whatsappNumber: "923369863734",
    address: "Islamabad, Pakistan",
    city: "Islamabad",
    businessHours: [
      { label: "Morning", start: "09:00", end: "12:00" },
      { label: "Evening", start: "20:00", end: "23:00" },
    ],
    announcementBar: {
      enabled: true,
      text: "Ordering windows: 9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM · Fresh homemade flavour daily",
    },
    reviews: [
      {
        name: "Ayesha K.",
        rating: 5,
        comment:
          "The breakfast deals taste just like home. Andda Ghotala and chai made my morning!",
        date: "2026-06-12",
      },
      {
        name: "Hamza R.",
        rating: 5,
        comment:
          "Chicken Roll Paratha is generously filled and the spicy mayo dip is addictive.",
        date: "2026-06-20",
      },
      {
        name: "Sara M.",
        rating: 5,
        comment:
          "Finally a homemade shawarma that feels fresh, not oily. Ordering again tonight.",
        date: "2026-07-02",
      },
      {
        name: "Bilal A.",
        rating: 4,
        comment:
          "Parathas are flaky and the tea is comforting. Perfect evening snack combo.",
        date: "2026-07-15",
      },
    ],
  });

  await SiteContent.insertMany([
    {
      key: "homepage.hero",
      section: "homepage",
      data: {
        headline: "Homemade Flavour, Made to Make You Smile.",
        supporting:
          "From comforting breakfasts to generously filled shawarmas and paratha rolls, every Yummilicious order is freshly prepared with homemade care.",
        image: FOOD.hero,
        ctaPrimary: "Order Your Favourites",
        ctaSecondary: "Explore the Menu",
      },
    },
    {
      key: "homepage.story",
      section: "homepage",
      data: {
        heading: "Made at Home. Remembered Long After.",
        body: "At Yummilicious, food is prepared with the same care, warmth, and attention we bring to our own family table. We use familiar ingredients, freshly prepared fillings, homemade sauces, and comforting recipes to turn everyday meals into something worth craving.",
        images: [FOOD.cooking, FOOD.dough, FOOD.plate],
      },
    },
    {
      key: "homepage.cta",
      section: "homepage",
      data: {
        heading: "Your Next Craving Is Only a Click Away.",
        ctaPrimary: "Start Your Order",
        ctaSecondary: "View Today's Deals",
      },
    },
    {
      key: "about.hero",
      section: "about",
      data: {
        heading: "Homemade Food, Made from the Heart.",
        image: FOOD.cooking,
      },
    },
    {
      key: "about.story",
      section: "about",
      data: {
        body: "At Yummilicious, we believe the most memorable food is made with care. What began as a passion for comforting homemade meals has grown into a menu filled with breakfast favourites, generously filled sandwiches, crispy parathas, shawarmas, roll parathas, and soothing cups of tea.",
      },
    },
    {
      key: "about.promise",
      section: "about",
      data: {
        body: "We prepare every order with the warmth of a home kitchen and the attention your meal deserves.",
        cta: "Come Hungry. Leave Yummilicious.",
      },
    },
  ]);

  await GalleryImage.insertMany([
    { title: "Morning Plate", alt: "Homemade breakfast plate", url: FOOD.anddaGhotala, category: "breakfast", displayOrder: 1 },
    { title: "Egg Sandwich", alt: "Egg sandwich close-up", url: FOOD.eggSandwich, category: "sandwiches", displayOrder: 2 },
    { title: "Golden Paratha", alt: "Flaky paratha", url: FOOD.paratha, category: "breakfast", displayOrder: 3 },
    { title: "Shawarma Wrap", alt: "Chicken shawarma", url: FOOD.shawarma, category: "shawarma", displayOrder: 4 },
    { title: "Roll Paratha", alt: "Chicken roll paratha", url: FOOD.chickenRoll, category: "rolls", displayOrder: 5 },
    { title: "Special Tea", alt: "Cup of special tea", url: FOOD.specialTea, category: "tea", displayOrder: 6 },
    { title: "Cardamom Chai", alt: "Cardamom tea", url: FOOD.cardamomTea, category: "tea", displayOrder: 7 },
    { title: "Dough Prep", alt: "Preparing dough", url: FOOD.dough, category: "behind-the-scenes", displayOrder: 8 },
    { title: "Kitchen Care", alt: "Cooking in kitchen", url: FOOD.cooking, category: "behind-the-scenes", displayOrder: 9 },
    { title: "French Toast", alt: "French toast with sauce", url: FOOD.frenchToast, category: "breakfast", displayOrder: 10 },
    { title: "Fried Egg", alt: "Fresh fried egg", url: FOOD.friedEgg, category: "breakfast", displayOrder: 11 },
    { title: "Feast Spread", alt: "Food spread", url: FOOD.plate, category: "general", displayOrder: 12 },
  ]);

  console.log("✅ Seed complete");
  console.log(`   Admin: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Products: ${created.length}`);
  console.log(`   Categories: ${cats.length}`);
  console.log(`   Add-ons: ${addons.length}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

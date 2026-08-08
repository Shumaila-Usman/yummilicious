import type { ISaleConfig, IVariant, IProductOption, DietaryTag } from "@/types";

export interface StoreProduct {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  categories: { _id: string; name: string; slug: string }[];
  basePrice: number;
  variants: IVariant[];
  options: IProductOption[];
  addonIds: string[];
  images: { url: string; alt?: string; order: number }[];
  featuredImage?: string;
  ingredients: string[];
  dietaryTags: DietaryTag[];
  includes?: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  isSoldOut: boolean;
  preparationTime?: number;
  sale: ISaleConfig;
  seoTitle?: string;
  seoDescription?: string;
  displayOrder: number;
}

export interface StoreCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
}

export interface StoreAddon {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  size?: string;
  maxQuantity: number;
  displayOrder: number;
}

export interface StoreGalleryImage {
  _id: string;
  title: string;
  alt: string;
  url: string;
  category: string;
}

export const CONTACT = {
  phone: "03369863734",
  email: "yummilicious321@gmail.com",
  whatsapp: "923369863734",
} as const;

/** Shared account details for JazzCash / EasyPaisa / bank transfers */
export const ONLINE_PAYMENT = {
  accountName: "Yummilicious",
  jazzcash: CONTACT.phone,
  easypaisa: CONTACT.phone,
  bankName: "JazzCash / EasyPaisa",
  note: "Pay securely on the site via JazzCash. Your order is confirmed only after payment succeeds.",
} as const;

export const PREORDER_PAYMENT = {
  ...ONLINE_PAYMENT,
  note: "Full 100% advance payment is required to confirm every pre-order.",
} as const;

const IMG = {
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
};

export const FALLBACK_CATEGORIES: StoreCategory[] = [
  {
    _id: "cat-breakfast",
    name: "Breakfast",
    slug: "breakfast",
    description: "Warm morning favourites",
    image: IMG.anddaGhotala,
    displayOrder: 1,
  },
  {
    _id: "cat-sandwiches",
    name: "Sandwiches",
    slug: "sandwiches",
    description: "Hearty homemade sandwiches",
    image: IMG.eggSandwich,
    displayOrder: 2,
  },
  {
    _id: "cat-shawarma",
    name: "Shawarma",
    slug: "shawarma",
    description: "Spiced grilled wraps",
    image: IMG.shawarma,
    displayOrder: 3,
  },
  {
    _id: "cat-rolls",
    name: "Roll Parathas",
    slug: "roll-parathas",
    description: "Generously filled roll parathas",
    image: IMG.chickenRoll,
    displayOrder: 4,
  },
  {
    _id: "cat-dips",
    name: "Dips",
    slug: "dips",
    description: "Signature sauces & dips",
    image: IMG.shawarmaDip,
    displayOrder: 5,
  },
  {
    _id: "cat-deals",
    name: "Breakfast Deals",
    slug: "breakfast-deals",
    description: "Complete morning combos",
    image: IMG.deal1,
    displayOrder: 6,
  },
  {
    _id: "cat-tea",
    name: "Tea",
    slug: "tea",
    description: "Comforting cups of chai",
    image: IMG.specialTea,
    displayOrder: 7,
  },
  {
    _id: "cat-beverages",
    name: "Beverages",
    slug: "beverages",
    description: "Chilled drinks",
    image: IMG.pepsi,
    displayOrder: 8,
  },
];

const cat = (slug: string) => {
  const found = FALLBACK_CATEGORIES.find((c) => c.slug === slug)!;
  return { _id: found._id, name: found.name, slug: found.slug };
};

const noSale: ISaleConfig = { enabled: false, type: "percentage", value: 0 };

/** Dips + soft drinks — only shawarma, roll parathas, malai boti, anda ghotala */
export const WRAP_ADDONS: StoreAddon[] = [
  {
    _id: "addon-shawarma-30",
    name: "Shawarma Dip (30ml)",
    slug: "shawarma-dip-30ml",
    price: 40,
    size: "30 ml",
    maxQuantity: 5,
    displayOrder: 1,
  },
  {
    _id: "addon-shawarma-85",
    name: "Shawarma Dip (85ml)",
    slug: "shawarma-dip-85ml",
    price: 90,
    size: "85 ml",
    maxQuantity: 5,
    displayOrder: 2,
  },
  {
    _id: "addon-spicy-mayo-30",
    name: "Spicy Mayo Dip (30ml)",
    slug: "spicy-mayo-dip-30ml",
    price: 40,
    size: "30 ml",
    maxQuantity: 5,
    displayOrder: 3,
  },
  {
    _id: "addon-spicy-mayo-85",
    name: "Spicy Mayo Dip (85ml)",
    slug: "spicy-mayo-dip-85ml",
    price: 90,
    size: "85 ml",
    maxQuantity: 5,
    displayOrder: 4,
  },
  {
    _id: "addon-cumin-30",
    name: "Cumin Yogurt Dip (30ml)",
    slug: "cumin-yogurt-dip-30ml",
    price: 40,
    size: "30 ml",
    maxQuantity: 5,
    displayOrder: 5,
  },
  {
    _id: "addon-cumin-85",
    name: "Cumin Yogurt Dip (85ml)",
    slug: "cumin-yogurt-dip-85ml",
    price: 90,
    size: "85 ml",
    maxQuantity: 5,
    displayOrder: 6,
  },
  {
    _id: "addon-pepsi",
    name: "Pepsi 345ml",
    slug: "pepsi-345ml",
    price: 70,
    size: "345 ml",
    maxQuantity: 5,
    displayOrder: 7,
  },
  {
    _id: "addon-coke",
    name: "Coke 350ml",
    slug: "coke-350ml",
    price: 80,
    size: "350 ml",
    maxQuantity: 5,
    displayOrder: 8,
  },
];

/** Chai + cinnamon tea — breakfast-category products */
export const BREAKFAST_ADDONS: StoreAddon[] = [
  {
    _id: "addon-chai",
    name: "Chai (Special Tea)",
    slug: "chai-special-tea",
    price: 200,
    size: "180 ml",
    maxQuantity: 5,
    displayOrder: 9,
  },
  {
    _id: "addon-cinnamon-tea",
    name: "Cinnamon Tea",
    slug: "cinnamon-tea",
    price: 210,
    size: "180 ml",
    maxQuantity: 5,
    displayOrder: 10,
  },
];

export const FALLBACK_ADDONS: StoreAddon[] = [...WRAP_ADDONS, ...BREAKFAST_ADDONS];

export const WRAP_ADDON_IDS = WRAP_ADDONS.map((a) => a._id);
export const BREAKFAST_ADDON_IDS = BREAKFAST_ADDONS.map((a) => a._id);

/** Products that get dips + soft-drink add-ons */
export const WRAP_ADDON_PRODUCT_SLUGS = [
  "chicken-shawarma",
  "chicken-roll-paratha",
  "malai-boti-roll-paratha",
  "andda-ghotala",
] as const;

export function addonIdsForProduct(
  slug: string,
  categories: { slug: string }[]
): string[] {
  const ids: string[] = [];
  if ((WRAP_ADDON_PRODUCT_SLUGS as readonly string[]).includes(slug)) {
    ids.push(...WRAP_ADDON_IDS);
  }
  if (categories.some((c) => c.slug === "breakfast")) {
    ids.push(...BREAKFAST_ADDON_IDS);
  }
  return ids;
}

/** @deprecated use WRAP_ADDON_IDS / BREAKFAST_ADDON_IDS */
export const GLOBAL_ADDON_IDS = FALLBACK_ADDONS.map((a) => a._id);

/** Homepage Featured Favourites — exactly these four */
export const FEATURED_HOME_SLUGS = [
  "chicken-shawarma",
  "chicken-roll-paratha",
  "malai-boti-roll-paratha",
  "chicken-shami-egg-sandwich",
] as const;

const yolkOption: IProductOption = {
  name: "Yolk Preference",
  required: true,
  type: "single",
  choices: [
    { label: "Half-done yolk", priceModifier: 0 },
    { label: "Fully cooked yolk", priceModifier: 0 },
  ],
};

const dualEggOptions: IProductOption[] = [
  {
    name: "Egg 1 Yolk Preference",
    required: true,
    type: "single",
    choices: [
      { label: "Half-done yolk", priceModifier: 0 },
      { label: "Fully cooked yolk", priceModifier: 0 },
    ],
  },
  {
    name: "Egg 2 Yolk Preference",
    required: true,
    type: "single",
    choices: [
      { label: "Half-done yolk", priceModifier: 0 },
      { label: "Fully cooked yolk", priceModifier: 0 },
    ],
  },
];

function product(
  partial: Omit<StoreProduct, "addonIds" | "isAvailable" | "isSoldOut" | "sale" | "ingredients"> & {
    ingredients?: string[];
    addonIds?: string[];
  }
): StoreProduct {
  const { addonIds, ingredients, ...rest } = partial;
  return {
    ingredients: ingredients ?? [],
    ...rest,
    addonIds: addonIds ?? addonIdsForProduct(rest.slug, rest.categories),
    isAvailable: true,
    isSoldOut: false,
    sale: noSale,
  };
}

export const FALLBACK_PRODUCTS: StoreProduct[] = [
  product({
    _id: "p-egg-sandwich",
    name: "Egg Sandwich",
    slug: "egg-sandwich",
    shortDescription:
      "Fluffy scrambled eggs nestled between toasted bread with some sauces. A hearty breakfast sandwich perfect for starting your day.",
    fullDescription:
      "Fluffy scrambled eggs nestled between toasted bread with some sauces. A hearty breakfast sandwich perfect for starting your day.",
    categories: [cat("sandwiches"), cat("breakfast")],
    basePrice: 400,
    variants: [],
    options: [],
    images: [{ url: IMG.eggSandwich, alt: "Egg Sandwich", order: 0 }],
    featuredImage: IMG.eggSandwich,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: true,
    preparationTime: 15,
    displayOrder: 1,
  }),
  product({
    _id: "p-french-toast",
    name: "French Toast",
    slug: "french-toast",
    shortDescription:
      "Soft and fresh French toast served with delicious chocolate sauce for a delightful breakfast experience.",
    fullDescription:
      "Soft and fresh French toast served with delicious chocolate sauce for a delightful breakfast experience.",
    categories: [cat("breakfast")],
    basePrice: 360,
    variants: [
      { name: "2 pieces", price: 360, isDefault: true, isAvailable: true },
      { name: "3 pieces", price: 420, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.frenchToast, alt: "French Toast", order: 0 }],
    featuredImage: IMG.frenchToast,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: true,
    preparationTime: 15,
    displayOrder: 2,
  }),
  product({
    _id: "p-paratha",
    name: "Paratha",
    slug: "paratha",
    shortDescription:
      "A flaky pan-fried flatbread made from layered flour dough cooked until golden and crispy.",
    fullDescription:
      "A flaky pan-fried flatbread made from layered flour dough cooked until golden and crispy.",
    categories: [cat("breakfast")],
    basePrice: 250,
    variants: [
      { name: "Refined flour paratha", price: 250, isDefault: true, isAvailable: true },
      { name: "Whole wheat flour paratha", price: 280, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.paratha, alt: "Paratha", order: 0 }],
    featuredImage: IMG.paratha,
    dietaryTags: ["vegetarian"],
    isFeatured: true,
    preparationTime: 12,
    displayOrder: 3,
  }),
  product({
    _id: "p-fried-egg",
    name: "Fried Egg",
    slug: "fried-egg",
    shortDescription: "A cooked egg with firm white and a runny or set yolk.",
    fullDescription: "A cooked egg with firm white and a runny or set yolk.",
    categories: [cat("breakfast")],
    basePrice: 250,
    variants: [],
    options: [yolkOption],
    images: [{ url: IMG.friedEgg, alt: "Fried Egg", order: 0 }],
    featuredImage: IMG.friedEgg,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: false,
    preparationTime: 8,
    displayOrder: 4,
  }),
  product({
    _id: "p-andda-ghotala",
    name: "Andda Ghotala",
    slug: "andda-ghotala",
    shortDescription: "A fluffy egg cooked with mixed vegetables and some spices.",
    fullDescription: "A fluffy egg cooked with mixed vegetables and some spices.",
    categories: [cat("breakfast")],
    basePrice: 350,
    variants: [],
    options: [],
    images: [{ url: IMG.anddaGhotala, alt: "Andda Ghotala", order: 0 }],
    featuredImage: IMG.anddaGhotala,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: true,
    preparationTime: 15,
    displayOrder: 5,
  }),
  product({
    _id: "p-shami-egg",
    name: "Chicken Shami Egg Sandwich",
    slug: "chicken-shami-egg-sandwich",
    shortDescription:
      "Delicious chicken shami patty combined with a fluffy fried egg served between soft bread slices. A hearty breakfast sandwich perfect for starting your day.",
    fullDescription:
      "Delicious chicken shami patty combined with a fluffy fried egg served between soft bread slices. A hearty breakfast sandwich perfect for starting your day.",
    categories: [cat("sandwiches"), cat("breakfast")],
    basePrice: 450,
    variants: [],
    options: [],
    images: [{ url: IMG.shamiEgg, alt: "Chicken Shami Egg Sandwich", order: 0 }],
    featuredImage: IMG.shamiEgg,
    dietaryTags: ["contains-egg", "non-vegetarian"],
    isFeatured: true,
    preparationTime: 18,
    displayOrder: 6,
  }),
  product({
    _id: "p-shawarma",
    name: "Chicken Shawarma",
    slug: "chicken-shawarma",
    shortDescription:
      "Thinly sliced and spiced grilled chicken wrapped in pita bread served with special sauce and vegetables.",
    fullDescription:
      "Thinly sliced and spiced grilled chicken wrapped in pita bread served with special sauce and vegetables.",
    categories: [cat("shawarma")],
    basePrice: 400,
    variants: [
      { name: "Medium", price: 400, isDefault: true, isAvailable: true },
      { name: "Extra Large", price: 700, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.shawarma, alt: "Chicken Shawarma", order: 0 }],
    featuredImage: IMG.shawarma,
    dietaryTags: ["non-vegetarian"],
    isFeatured: true,
    preparationTime: 20,
    displayOrder: 7,
  }),
  product({
    _id: "p-chicken-roll",
    name: "Chicken Roll Paratha",
    slug: "chicken-roll-paratha",
    shortDescription:
      "Tender smoked chicken pieces wrapped in a soft warm paratha with fresh salad and flavorful sauces for a satisfying meal.",
    fullDescription:
      "Tender smoked chicken pieces wrapped in a soft warm paratha with fresh salad and flavorful sauces for a satisfying meal.",
    categories: [cat("roll-parathas")],
    basePrice: 450,
    variants: [
      { name: "Small (6 inches)", price: 450, isDefault: true, isAvailable: true },
      { name: "Regular (8 inches)", price: 550, isAvailable: true },
      { name: "Large (12 inches)", price: 750, isAvailable: true },
      { name: "Extra Large (16 inches)", price: 950, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.chickenRoll, alt: "Chicken Roll Paratha", order: 0 }],
    featuredImage: IMG.chickenRoll,
    dietaryTags: ["non-vegetarian"],
    isFeatured: true,
    preparationTime: 22,
    displayOrder: 8,
  }),
  product({
    _id: "p-malai-boti",
    name: "Malai Boti Roll Paratha",
    slug: "malai-boti-roll-paratha",
    shortDescription:
      "Tender malai boti wrapped in a large paratha roll along with some sauces.",
    fullDescription:
      "Tender malai boti wrapped in a large paratha roll along with some sauces.",
    categories: [cat("roll-parathas")],
    basePrice: 450,
    variants: [
      { name: "Small (6 inches)", price: 450, isDefault: true, isAvailable: true },
      { name: "Regular (8 inches)", price: 550, isAvailable: true },
      { name: "Large (12 inches)", price: 750, isAvailable: true },
      { name: "Extra Large (16 inches)", price: 950, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.malaiBoti, alt: "Malai Boti Roll Paratha", order: 0 }],
    featuredImage: IMG.malaiBoti,
    dietaryTags: ["non-vegetarian"],
    isFeatured: true,
    preparationTime: 22,
    displayOrder: 9,
  }),
  product({
    _id: "p-deal-1",
    name: "Breakfast Deal 1",
    slug: "breakfast-deal-1",
    shortDescription:
      "Refined flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
    fullDescription:
      "Refined flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
    categories: [cat("breakfast-deals"), cat("breakfast")],
    basePrice: 650,
    variants: [],
    options: [],
    includes: [
      "Refined flour paratha",
      "Andda Ghotala",
      "Special tea (180 ml)",
      "Sugar served separately",
    ],
    images: [{ url: IMG.deal1, alt: "Breakfast Deal 1", order: 0 }],
    featuredImage: IMG.deal1,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: true,
    preparationTime: 25,
    displayOrder: 10,
  }),
  product({
    _id: "p-deal-2",
    name: "Breakfast Deal 2",
    slug: "breakfast-deal-2",
    shortDescription:
      "Whole flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
    fullDescription:
      "Whole flour paratha, andda ghotala and special tea (180 ml) with separate sugar.",
    categories: [cat("breakfast-deals"), cat("breakfast")],
    basePrice: 680,
    variants: [],
    options: [],
    includes: [
      "Whole flour paratha",
      "Andda Ghotala",
      "Special tea (180 ml)",
      "Sugar served separately",
    ],
    images: [{ url: IMG.deal2, alt: "Breakfast Deal 2", order: 0 }],
    featuredImage: IMG.deal2,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: false,
    preparationTime: 25,
    displayOrder: 11,
  }),
  product({
    _id: "p-deal-3",
    name: "Breakfast Deal 3",
    slug: "breakfast-deal-3",
    shortDescription:
      "Refined flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
    fullDescription:
      "Refined flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
    categories: [cat("breakfast-deals"), cat("breakfast")],
    basePrice: 700,
    variants: [],
    options: dualEggOptions,
    includes: [
      "Refined flour paratha",
      "Two fried eggs",
      "Special tea (180 ml)",
      "Sugar served separately",
    ],
    images: [{ url: IMG.deal3, alt: "Breakfast Deal 3", order: 0 }],
    featuredImage: IMG.deal3,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: false,
    preparationTime: 25,
    displayOrder: 12,
  }),
  product({
    _id: "p-deal-4",
    name: "Breakfast Deal 4",
    slug: "breakfast-deal-4",
    shortDescription:
      "Whole wheat flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
    fullDescription:
      "Whole wheat flour paratha, two fried eggs and special tea (180 ml) with separate sugar.",
    categories: [cat("breakfast-deals"), cat("breakfast")],
    basePrice: 730,
    variants: [],
    options: dualEggOptions,
    includes: [
      "Whole wheat flour paratha",
      "Two fried eggs",
      "Special tea (180 ml)",
      "Sugar served separately",
    ],
    images: [{ url: IMG.deal4, alt: "Breakfast Deal 4", order: 0 }],
    featuredImage: IMG.deal4,
    dietaryTags: ["contains-egg", "vegetarian"],
    isFeatured: false,
    preparationTime: 25,
    displayOrder: 13,
  }),
  product({
    _id: "p-special-tea",
    name: "Special Tea",
    slug: "special-tea",
    shortDescription:
      "A warm beverage made by mixing tea with milk provided with separate sugar.",
    fullDescription:
      "A warm beverage made by mixing tea with milk provided with separate sugar.",
    categories: [cat("tea")],
    basePrice: 300,
    variants: [
      { name: "180 ml", price: 300, isDefault: true, isAvailable: true },
      { name: "250 ml", price: 350, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.specialTea, alt: "Special Tea", order: 0 }],
    featuredImage: IMG.specialTea,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 8,
    displayOrder: 14,
  }),
  product({
    _id: "p-cardamom-tea",
    name: "Cardamom Tea",
    slug: "cardamom-tea",
    shortDescription: "A fragrant beverage made by brewing tea with cardamom pods.",
    fullDescription: "A fragrant beverage made by brewing tea with cardamom pods.",
    categories: [cat("tea")],
    basePrice: 310,
    variants: [
      { name: "180 ml", price: 310, isDefault: true, isAvailable: true },
      { name: "250 ml", price: 360, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.cardamomTea, alt: "Cardamom Tea", order: 0 }],
    featuredImage: IMG.cardamomTea,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 8,
    displayOrder: 15,
  }),
  product({
    _id: "p-pepsi",
    name: "Pepsi 345ml",
    slug: "pepsi",
    shortDescription:
      "Refreshing Pepsi beverage in a convenient 345 ml bottle perfect for any occasion.",
    fullDescription:
      "Refreshing Pepsi beverage in a convenient 345 ml bottle perfect for any occasion.",
    categories: [cat("beverages")],
    basePrice: 170,
    variants: [],
    options: [],
    images: [{ url: IMG.pepsi, alt: "Pepsi 345 ml", order: 0 }],
    featuredImage: IMG.pepsi,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 2,
    displayOrder: 16,
  }),
  product({
    _id: "p-coke",
    name: "Coke 350ml",
    slug: "coke",
    shortDescription:
      "Refreshing Coke in a convenient 350 ml bottle. Crisp carbonated cola with a classic taste perfect for any occasion.",
    fullDescription:
      "Refreshing Coke in a convenient 350 ml bottle. Crisp carbonated cola with a classic taste perfect for any occasion.",
    categories: [cat("beverages")],
    basePrice: 180,
    variants: [],
    options: [],
    images: [{ url: IMG.coke, alt: "Coke 350 ml", order: 0 }],
    featuredImage: IMG.coke,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 2,
    displayOrder: 17,
  }),
  product({
    _id: "p-shawarma-dip",
    name: "Shawarma Dip",
    slug: "shawarma-dip",
    shortDescription: "Our signature shawarma sauce — choose your cup size.",
    fullDescription:
      "Our signature shawarma sauce, perfect with wraps and rolls. Choose 30 ml or 85 ml.",
    categories: [cat("dips")],
    basePrice: 140,
    variants: [
      { name: "30 ml", price: 140, isDefault: true, isAvailable: true },
      { name: "85 ml", price: 190, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.shawarmaDip, alt: "Shawarma Dip", order: 0 }],
    featuredImage: IMG.shawarmaDip,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 2,
    displayOrder: 18,
  }),
  product({
    _id: "p-spicy-mayo-dip",
    name: "Spicy Mayo Dip",
    slug: "spicy-mayo-dip",
    shortDescription: "Creamy spicy mayo — choose your cup size.",
    fullDescription: "Creamy spicy mayo dip. Choose 30 ml or 85 ml.",
    categories: [cat("dips")],
    basePrice: 140,
    variants: [
      { name: "30 ml", price: 140, isDefault: true, isAvailable: true },
      { name: "85 ml", price: 190, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.spicyMayoDip, alt: "Spicy Mayo Dip", order: 0 }],
    featuredImage: IMG.spicyMayoDip,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 2,
    displayOrder: 19,
  }),
  product({
    _id: "p-cumin-yogurt-dip",
    name: "Cumin Yogurt Dip",
    slug: "cumin-yogurt-dip",
    shortDescription: "Cool cumin yogurt — choose your cup size.",
    fullDescription: "Cool cumin yogurt dip. Choose 30 ml or 85 ml.",
    categories: [cat("dips")],
    basePrice: 140,
    variants: [
      { name: "30 ml", price: 140, isDefault: true, isAvailable: true },
      { name: "85 ml", price: 190, isAvailable: true },
    ],
    options: [],
    images: [{ url: IMG.cuminYogurtDip, alt: "Cumin Yogurt Dip", order: 0 }],
    featuredImage: IMG.cuminYogurtDip,
    dietaryTags: ["vegetarian"],
    isFeatured: false,
    preparationTime: 2,
    displayOrder: 20,
  }),
];

export const FALLBACK_GALLERY: StoreGalleryImage[] = [
  {
    _id: "g1",
    title: "Morning Spread",
    alt: "Breakfast spread",
    url: IMG.deal1,
    category: "breakfast",
  },
  {
    _id: "g2",
    title: "Shawarma Night",
    alt: "Chicken shawarma",
    url: IMG.shawarma,
    category: "shawarma",
  },
  {
    _id: "g3",
    title: "Paratha Roll",
    alt: "Chicken roll paratha",
    url: IMG.chickenRoll,
    category: "rolls",
  },
  {
    _id: "g4",
    title: "Special Tea",
    alt: "Cup of special tea",
    url: IMG.specialTea,
    category: "tea",
  },
  {
    _id: "g5",
    title: "Shami Egg Sandwich",
    alt: "Chicken shami egg sandwich",
    url: IMG.shamiEgg,
    category: "sandwiches",
  },
  {
    _id: "g6",
    title: "Malai Boti Roll",
    alt: "Malai boti roll paratha",
    url: IMG.malaiBoti,
    category: "rolls",
  },
];

export const FALLBACK_REVIEWS = [
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
    name: "Fatima S.",
    rating: 5,
    comment:
      "Paratha rolls are flaky perfection. Love that they only take orders during specific hours — everything arrives fresh!",
    date: "2026-02-20",
  },
  {
    name: "Omar M.",
    rating: 4,
    comment:
      "Morning deal combo is unbeatable value. Chai is karak just the way I like it. Yummilicious lives up to the name!",
    date: "2026-03-05",
  },
];

export const FALLBACK_SETTINGS = {
  brandName: "Yummilicious",
  tagline: "Homemade Comfort. Unforgettable Flavour.",
  supportingLine:
    "Freshly prepared homemade favourites, made with care and delivered with flavour.",
  deliveryFee: 150,
  freeDeliveryMin: 1500,
  minimumOrderValue: 300,
  estimatedPrepTime: 30,
  businessHours: [
    { label: "Morning", start: "09:00", end: "12:00" },
    { label: "Evening", start: "20:00", end: "23:00" },
  ],
};

export function getProductImage(product: StoreProduct): string {
  const raw =
    product.featuredImage ||
    product.images?.[0]?.url ||
    "/products/egg-sandwich.png";
  // Legacy disk uploads are unavailable on serverless hosts
  if (raw.startsWith("/uploads/")) return "/products/egg-sandwich.png";
  return raw;
}

export function resolveAddons(
  addonIds?: string[],
  catalog: StoreAddon[] = FALLBACK_ADDONS
): StoreAddon[] {
  if (!addonIds?.length) return [];
  const byId = new Map(catalog.map((a) => [a._id, a]));
  const bySlug = new Map(catalog.map((a) => [a.slug, a]));
  const fallbackIdToSlug = new Map(FALLBACK_ADDONS.map((a) => [a._id, a.slug]));
  return addonIds
    .map((id) => {
      const fallbackSlug = fallbackIdToSlug.get(id);
      return byId.get(id) ?? bySlug.get(id) ?? (fallbackSlug ? bySlug.get(fallbackSlug) : undefined);
    })
    .filter((a): a is StoreAddon => Boolean(a));
}

/** Storefront add-ons from catalogue rules (wrap dips / breakfast tea). */
export function resolveAddonsForProduct(
  product: Pick<StoreProduct, "slug" | "categories">,
  catalog: StoreAddon[] = FALLBACK_ADDONS
): StoreAddon[] {
  return resolveAddons(addonIdsForProduct(product.slug, product.categories), catalog);
}

import type { ISaleConfig, IVariant } from "@/types";
import { percentageOff } from "@/lib/utils/format";

export function isSaleActive(sale?: ISaleConfig | null, now = new Date()): boolean {
  if (!sale?.enabled) return false;
  if (sale.startDate && new Date(sale.startDate) > now) return false;
  if (sale.endDate && new Date(sale.endDate) < now) return false;
  return true;
}

export function applySale(basePrice: number, sale?: ISaleConfig | null, now = new Date()) {
  if (!isSaleActive(sale, now)) {
    return {
      originalPrice: basePrice,
      finalPrice: basePrice,
      discount: 0,
      percentOff: 0,
      onSale: false,
    };
  }

  let finalPrice = basePrice;
  if (sale!.type === "percentage") {
    finalPrice = basePrice - (basePrice * sale!.value) / 100;
  } else if (sale!.type === "fixed") {
    finalPrice = basePrice - sale!.value;
  } else if (sale!.type === "sale_price") {
    finalPrice = sale!.value;
  }

  finalPrice = Math.max(0, Math.round(finalPrice));
  const discount = Math.max(0, basePrice - finalPrice);

  return {
    originalPrice: basePrice,
    finalPrice,
    discount,
    percentOff: percentageOff(basePrice, finalPrice),
    onSale: discount > 0,
  };
}

export function getEffectiveVariantPrice(
  variant: IVariant,
  productSale?: ISaleConfig | null,
  now = new Date()
) {
  const base = variant.price;
  const priced = applySale(base, productSale, now);
  return {
    ...priced,
    variantName: variant.name,
  };
}

export function computeLineTotal(params: {
  unitBase: number;
  optionModifiers?: number;
  addonTotal?: number;
  quantity: number;
}): number {
  const { unitBase, optionModifiers = 0, addonTotal = 0, quantity } = params;
  return Math.round((unitBase + optionModifiers + addonTotal) * quantity);
}

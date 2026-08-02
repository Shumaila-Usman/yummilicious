"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import {
  applySale,
  getEffectiveVariantPrice,
  computeLineTotal,
} from "@/lib/pricing/calculate";
import { formatPKR } from "@/lib/utils/format";
import type { StoreProduct } from "@/lib/data/fallback";
import { getProductImage } from "@/lib/data/fallback";
import type { CartAddon, CartOptionSelection } from "@/types";
import { cn } from "@/lib/utils/cn";

interface AddOnItem {
  _id: string;
  name: string;
  price: number;
  maxQuantity: number;
  size?: string;
}

interface AddToCartPanelProps {
  product: StoreProduct;
  addons?: AddOnItem[];
  compact?: boolean;
}

export function AddToCartPanel({ product, addons = [], compact }: AddToCartPanelProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { open: storeOpen, message: storeMessage } = useStoreStatus();

  const availableVariants = product.variants?.filter((v) => v.isAvailable !== false) ?? [];
  const defaultVariant =
    availableVariants.find((v) => v.isDefault) || availableVariants[0];

  const [variantName, setVariantName] = useState(defaultVariant?.name ?? "");
  const [optionSelections, setOptionSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.options?.forEach((opt) => {
      if (opt.choices[0]) init[opt.name] = opt.choices[0].label;
    });
    return init;
  });
  const [addonQtys, setAddonQtys] = useState<Record<string, number>>({});
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  const selectedVariant = availableVariants.find((v) => v.name === variantName);
  const unitBase = selectedVariant
    ? getEffectiveVariantPrice(selectedVariant, product.sale).finalPrice
    : applySale(product.basePrice, product.sale).finalPrice;

  const options: CartOptionSelection[] = useMemo(() => {
    return (product.options ?? []).flatMap((opt) => {
      const choice = optionSelections[opt.name];
      if (!choice) return [];
      const choiceDef = opt.choices.find((c) => c.label === choice);
      return [
        {
          optionName: opt.name,
          choice,
          priceModifier: choiceDef?.priceModifier ?? 0,
        },
      ];
    });
  }, [product.options, optionSelections]);

  const cartAddons: CartAddon[] = useMemo(() => {
    return addons.flatMap((addon) => {
      const qty = addonQtys[addon._id] ?? 0;
      if (qty <= 0) return [];
      return [
        {
          addonId: addon._id,
          name: addon.name,
          size: addon.size,
          price: addon.price,
          quantity: qty,
        },
      ];
    });
  }, [addons, addonQtys]);

  const optionMod = options.reduce((a, o) => a + (o.priceModifier ?? 0), 0);
  const addonTotal = cartAddons.reduce((a, ad) => a + ad.price * ad.quantity, 0);
  const lineTotal = computeLineTotal({
    unitBase,
    optionModifiers: optionMod,
    addonTotal,
    quantity,
  });

  const missingRequired = (product.options ?? [])
    .filter((o) => o.required)
    .some((o) => !optionSelections[o.name]);

  const canAdd =
    storeOpen &&
    product.isAvailable &&
    !product.isSoldOut &&
    !missingRequired &&
    (availableVariants.length === 0 || !!selectedVariant);

  const handleAdd = () => {
    if (!storeOpen) {
      toast.error("Ordering is currently closed", { description: storeMessage });
      return;
    }
    if (missingRequired) {
      toast.error("Please select all required options");
      return;
    }

    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: getProductImage(product),
      variant: selectedVariant
        ? { name: selectedVariant.name, price: unitBase }
        : undefined,
      options,
      addons: cartAddons,
      quantity,
      unitPrice: unitBase,
      specialInstructions: instructions || undefined,
    });

    toast.success(`${product.name} added to cart!`);
    setQuantity(1);
    setInstructions("");
  };

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {!storeOpen && (
        <div className="rounded-xl border border-burgundy/20 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
          {storeMessage}
        </div>
      )}

      {availableVariants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-brown">Size</p>
          <div className="flex flex-wrap gap-2">
            {availableVariants.map((v) => {
              const priced = getEffectiveVariantPrice(v, product.sale);
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setVariantName(v.name)}
                  className={cn(
                    "focus-ring rounded-full border px-4 py-2 text-sm font-medium transition",
                    variantName === v.name
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-burgundy/20 bg-white text-brown hover:border-burgundy/40"
                  )}
                >
                  {v.name} · {formatPKR(priced.finalPrice)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(product.options ?? []).map((opt) => (
        <div key={opt.name}>
          <p className="mb-2 text-sm font-semibold text-brown">
            {opt.name}
            {opt.required && <span className="text-burgundy"> *</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {opt.choices.map((choice) => (
              <button
                key={choice.label}
                type="button"
                onClick={() =>
                  setOptionSelections((prev) => ({ ...prev, [opt.name]: choice.label }))
                }
                className={cn(
                  "focus-ring rounded-full border px-3 py-1.5 text-sm transition",
                  optionSelections[opt.name] === choice.label
                    ? "border-orange bg-orange/10 text-brown"
                    : "border-burgundy/15 bg-white text-muted hover:border-orange/40"
                )}
              >
                {choice.label}
                {(choice.priceModifier ?? 0) > 0 &&
                  ` (+${formatPKR(choice.priceModifier!)})`}
              </button>
            ))}
          </div>
        </div>
      ))}

      {addons.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-brown">Add-ons</p>
          <div className="divide-y divide-burgundy/10 overflow-hidden rounded-xl border border-burgundy/10 bg-white">
            {addons.map((addon) => {
              const qty = addonQtys[addon._id] ?? 0;
              const enabled = qty > 0;
              return (
                <div
                  key={addon._id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <p className="min-w-0 text-sm font-medium leading-snug text-brown">
                    {addon.name}
                    {addon.size ? (
                      <span className="font-normal text-muted"> · {addon.size}</span>
                    ) : null}
                  </p>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`Toggle ${addon.name}`}
                      onClick={() =>
                        setAddonQtys((p) => ({
                          ...p,
                          [addon._id]: enabled ? 0 : 1,
                        }))
                      }
                      className={cn(
                        "focus-ring relative h-6 w-11 rounded-full transition",
                        enabled ? "bg-emerald-500" : "bg-burgundy/20"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                          enabled && "translate-x-5"
                        )}
                      />
                    </button>
                    <p className="text-xs font-medium text-brown">
                      +{formatPKR(addon.price)}
                    </p>
                    {enabled && addon.maxQuantity > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setAddonQtys((p) => ({
                              ...p,
                              [addon._id]: Math.max(0, qty - 1),
                            }))
                          }
                          className="focus-ring rounded-full p-0.5 hover:bg-burgundy/10"
                          aria-label="Decrease addon"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[1rem] text-center text-xs">{qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAddonQtys((p) => ({
                              ...p,
                              [addon._id]: Math.min(addon.maxQuantity, qty + 1),
                            }))
                          }
                          className="focus-ring rounded-full p-0.5 hover:bg-burgundy/10"
                          aria-label="Increase addon"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!compact && (
        <div>
          <label htmlFor="instructions" className="mb-2 block text-sm font-semibold text-brown">
            Special Instructions
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Extra spicy, no onions, etc."
            rows={2}
            className="focus-ring w-full rounded-xl border border-burgundy/15 bg-white/80 px-4 py-2.5 text-base sm:text-sm"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full border border-burgundy/15 bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[2rem] text-center text-lg font-bold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="focus-ring rounded-full p-2 hover:bg-burgundy/10"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total</p>
          <p className="font-display text-xl font-bold text-burgundy sm:text-2xl">{formatPKR(lineTotal)}</p>
        </div>
      </div>

      <Button
        className="w-full gap-2"
        size="lg"
        magnetic
        disabled={!canAdd}
        onClick={handleAdd}
      >
        <ShoppingBag className="h-5 w-5" />
        {product.isSoldOut
          ? "Sold Out"
          : !storeOpen
            ? "Ordering Closed"
            : missingRequired
              ? "Select Required Options"
              : "Add to Cart"}
      </Button>
    </div>
  );
}

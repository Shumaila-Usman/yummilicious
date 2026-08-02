"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { formatPKR } from "@/lib/utils/format";
import { useStoreStatus } from "@/hooks/useStoreStatus";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const { open: storeOpen, message: storeMessage } = useStoreStatus();
  const subtotal = getSubtotal();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-[75] bg-brown/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 z-[76] flex h-full w-full max-w-md flex-col bg-cream pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-warm"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-burgundy/10 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-burgundy" />
                <h2 className="font-display text-xl font-bold text-burgundy">
                  Your Cart
                  {itemCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="focus-ring rounded-full p-2 text-brown hover:bg-burgundy/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                  <div className="rounded-full bg-burgundy/10 p-6">
                    <ShoppingBag className="h-10 w-10 text-burgundy/50" />
                  </div>
                  <p className="font-display text-lg text-brown">Your cart is empty</p>
                  <p className="text-sm text-muted">Add something delicious from our menu!</p>
                  <Button variant="secondary" onClick={() => { closeCart(); window.location.href = "/menu"; }}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-2xl border border-burgundy/10 bg-white/60 p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/menu/${item.slug}`}
                          onClick={closeCart}
                          className="truncate font-semibold text-brown hover:text-burgundy"
                        >
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-muted">{item.variant.name}</p>
                        )}
                        {item.options.length > 0 && (
                          <p className="text-xs text-muted">
                            {item.options.map((o) => o.choice).join(", ")}
                          </p>
                        )}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="flex items-center gap-1 rounded-full border border-burgundy/15 bg-cream">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="focus-ring rounded-full p-1.5 hover:bg-burgundy/10"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="focus-ring rounded-full p-1.5 hover:bg-burgundy/10"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-bold text-burgundy">
                              {formatPKR(
                                (item.unitPrice +
                                  item.addons.reduce((a, ad) => a + ad.price * ad.quantity, 0) +
                                  item.options.reduce((a, o) => a + (o.priceModifier ?? 0), 0)) *
                                  item.quantity
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="focus-ring rounded-full p-1 text-burgundy/60 hover:bg-burgundy/10 hover:text-burgundy"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-burgundy/10 bg-white/40 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-display text-xl font-bold text-burgundy">
                    {formatPKR(subtotal)}
                  </span>
                </div>
                {!storeOpen && (
                  <div
                    role="status"
                    className="mb-3 flex items-start gap-2 rounded-xl bg-burgundy-dark/10 px-3 py-2 text-sm text-burgundy-dark"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <p>{storeMessage || "Ordering is currently closed."}</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {storeOpen ? (
                    <Link href="/checkout" onClick={closeCart} className="block w-full">
                      <Button className="w-full" magnetic>
                        Checkout
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" disabled>
                      Checkout unavailable
                    </Button>
                  )}
                  <Link href="/cart" onClick={closeCart} className="block w-full">
                    <Button variant="outline" className="w-full">
                      View Full Cart
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

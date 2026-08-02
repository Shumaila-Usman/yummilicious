"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { OrderingHoursBanner } from "@/components/layout/OrderingHoursBanner";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { useCartStore } from "@/store/cart";

function unlockScroll() {
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  document.documentElement.classList.remove("lenis", "lenis-smooth");
  document.body.classList.remove("lenis", "lenis-smooth");
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const closeCart = useCartStore((s) => s.closeCart);

  useEffect(() => {
    unlockScroll();
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    unlockScroll();
    const onPageShow = () => unlockScroll();
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <>
      <CursorGlow />
      <OrderingHoursBanner />
      <Header />
      <main className="flex min-h-[60vh] flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <Toaster
        position="top-center"
        richColors
        closeButton
        offset="calc(env(safe-area-inset-top, 0px) + 12px)"
        toastOptions={{
          classNames: {
            toast: "font-body border border-burgundy/10 shadow-warm",
          },
        }}
      />
    </>
  );
}

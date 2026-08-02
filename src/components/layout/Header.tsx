"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Flame,
  Menu,
  Search,
  ShoppingBag,
  X,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCartHydration, useCartStore } from "@/store/cart";
import { FALLBACK_CATEGORIES } from "@/lib/data/fallback";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu", chevron: true },
  { href: "/deals", label: "Deals", flame: true },
  { href: "/pre-order", label: "Pre Order" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MENU_CATEGORIES = [
  { href: "/menu", label: "All Menu" },
  ...FALLBACK_CATEGORIES.map((c) => ({
    href: `/menu?category=${c.slug}`,
    label: c.name,
  })),
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cartHydrated = useCartHydration();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const visibleCount = cartHydrated ? itemCount : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : "/menu");
    setSearchQuery("");
    setSearchOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 overflow-visible px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))] lg:px-6">
        <div
          className={cn(
            "relative mx-auto flex max-w-7xl items-center gap-1.5 overflow-visible rounded-2xl border px-2 py-1.5 transition-all duration-500 sm:gap-4 sm:px-5 sm:py-3",
            scrolled
              ? "border-burgundy/10 bg-cream/95 shadow-[0_12px_40px_-12px_rgba(158,11,24,0.28)] backdrop-blur-xl"
              : "border-white/40 bg-cream/90 shadow-[0_8px_30px_-10px_rgba(53,26,18,0.18)] backdrop-blur-md"
          )}
        >
          <Logo
            size={48}
            href="/"
            className="relative z-20 -my-2 shrink-0 [&_img]:!h-12 [&_img]:!w-12 sm:-my-8 sm:[&_img]:!h-24 sm:[&_img]:!w-24"
          />

          <nav
            className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);

              if (link.chevron) {
                return (
                  <div
                    key={link.href}
                    ref={menuRef}
                    className="relative"
                    onMouseEnter={() => setMenuOpen(true)}
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      aria-expanded={menuOpen}
                      aria-haspopup="menu"
                      className={cn(
                        "focus-ring group relative inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-semibold transition-colors xl:px-3.5 xl:text-[15px]",
                        active || menuOpen
                          ? "text-burgundy"
                          : "text-brown/80 hover:text-burgundy"
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 opacity-60 transition-transform",
                          menuOpen && "rotate-180"
                        )}
                        aria-hidden
                      />
                      {(active || menuOpen) && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-burgundy"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>

                    <AnimatePresence>
                      {menuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          role="menu"
                          className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-burgundy/10 bg-cream py-2 shadow-[0_16px_40px_-12px_rgba(53,26,18,0.28)]"
                        >
                          {MENU_CATEGORIES.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              role="menuitem"
                              onClick={() => setMenuOpen(false)}
                              className="block px-4 py-2.5 text-sm font-medium text-brown transition hover:bg-burgundy/8 hover:text-burgundy"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "focus-ring group relative inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-semibold transition-colors xl:px-3.5 xl:text-[15px]",
                    active
                      ? "text-burgundy"
                      : "text-brown/80 hover:text-burgundy"
                  )}
                >
                  {link.flame && (
                    <Flame
                      className={cn(
                        "h-3.5 w-3.5",
                        active ? "text-orange" : "text-orange/70"
                      )}
                      aria-hidden
                    />
                  )}
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-burgundy"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="focus-ring hidden rounded-full p-2.5 text-brown/70 transition hover:bg-burgundy/8 hover:text-burgundy sm:inline-flex"
              aria-label="Search menu"
              aria-expanded={searchOpen}
              suppressHydrationWarning
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={openCart}
              className="focus-ring relative rounded-full p-2.5 text-brown/80 transition hover:bg-burgundy/8 hover:text-burgundy"
              aria-label={`Open cart, ${visibleCount} items`}
              suppressHydrationWarning
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence mode="popLayout">
                {visibleCount > 0 && (
                  <motion.span
                    key={visibleCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-bold text-cream"
                  >
                    {visibleCount > 99 ? "99+" : visibleCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <Link
              href="/menu"
              className="focus-ring hidden items-center gap-1.5 rounded-full bg-burgundy px-5 py-2.5 text-sm font-bold text-cream shadow-[0_8px_24px_-8px_rgba(158,11,24,0.55)] transition hover:bg-burgundy-dark sm:inline-flex"
            >
              Order Now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>

            <button
              type="button"
              className="focus-ring rounded-full p-2.5 text-burgundy lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSearch}
              className="mx-auto mt-2 hidden max-w-7xl sm:block"
            >
              <div className="relative rounded-2xl border border-burgundy/10 bg-cream/95 p-2 shadow-warm backdrop-blur-xl">
                <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  autoFocus
                  placeholder="Search breakfasts, shawarmas, rolls…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus-ring w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm text-brown placeholder:text-muted/70"
                  aria-label="Search menu"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[70] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-brown/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu overlay"
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 flex h-full w-[min(340px,92vw)] flex-col bg-cream pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-warm"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between border-b border-burgundy/10 p-4">
                <Logo size={48} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring rounded-full p-2 text-burgundy"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="border-b border-burgundy/10 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    placeholder="Search menu…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus-ring w-full rounded-full border border-burgundy/15 bg-white py-2.5 pl-9 pr-4 text-base sm:text-sm"
                  />
                </div>
              </form>

              <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {NAV_LINKS.map((link, i) => {
                  if (link.chevron) {
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i }}
                      >
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen((v) => !v)}
                          className={cn(
                            "focus-ring flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition",
                            isActive(link.href) || mobileMenuOpen
                              ? "bg-burgundy text-cream"
                              : "text-brown hover:bg-burgundy/10"
                          )}
                        >
                          {link.label}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              mobileMenuOpen && "rotate-180"
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileMenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-3"
                            >
                              {MENU_CATEGORIES.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-brown/80 hover:bg-burgundy/8 hover:text-burgundy"
                                >
                                  {item.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          "focus-ring flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-semibold transition",
                          isActive(link.href)
                            ? "bg-burgundy text-cream"
                            : "text-brown hover:bg-burgundy/10"
                        )}
                      >
                        {link.flame && <Flame className="h-4 w-4 text-orange" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * NAV_LINKS.length }}
                >
                  <Link
                    href="/track-order"
                    className={cn(
                      "focus-ring flex items-center gap-2 rounded-xl px-4 py-3.5 text-base font-semibold transition",
                      isActive("/track-order")
                        ? "bg-burgundy text-cream"
                        : "text-brown hover:bg-burgundy/10"
                    )}
                  >
                    Track Order
                  </Link>
                </motion.div>
              </div>

              <div className="border-t border-burgundy/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link
                  href="/menu"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring flex w-full items-center justify-center gap-2 rounded-full bg-burgundy py-3.5 text-sm font-bold text-cream"
                >
                  Order Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

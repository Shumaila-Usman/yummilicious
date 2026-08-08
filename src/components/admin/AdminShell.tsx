"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  PlusCircle,
  ShoppingBag,
  Users,
  FileText,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageSquareQuote,
  CircleHelp,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils/cn";

const PRIMARY_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: Layers },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const COMMERCE_NAV = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/addons", label: "Add-ons", icon: PlusCircle },
  { href: "/admin/media", label: "Media", icon: FileText },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  return <AdminShell>{children}</AdminShell>;
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-burgundy text-cream"
          : "text-brown/80 hover:bg-burgundy/10 hover:text-burgundy"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {active && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  onNavigate,
}: {
  title?: string;
  items: typeof PRIMARY_NAV;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      {title && (
        <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-muted">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavLink key={item.href} {...item} onClick={onNavigate} />
      ))}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-[var(--surface)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-burgundy/15 bg-cream lg:flex">
        <div className="border-b border-burgundy/10 p-5">
          <Logo href="/admin" size={40} withText />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavGroup items={PRIMARY_NAV} />
          <NavGroup title="Store" items={COMMERCE_NAV} />
        </nav>
        <div className="border-t border-burgundy/10 p-4">
          <p className="truncate text-xs text-muted">{session?.user?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-burgundy hover:bg-burgundy/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brown/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-cream shadow-xl">
            <div className="flex items-center justify-between border-b border-burgundy/10 p-4">
              <Logo href="/admin" size={36} withText />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-burgundy/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <NavGroup items={PRIMARY_NAV} onNavigate={() => setMobileOpen(false)} />
              <NavGroup
                title="Store"
                items={COMMERCE_NAV}
                onNavigate={() => setMobileOpen(false)}
              />
            </nav>
            <div className="border-t border-burgundy/10 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-burgundy hover:bg-burgundy/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-burgundy/10 bg-cream/95 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-brown hover:bg-burgundy/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-burgundy/70">
              Admin Portal
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-sm font-medium text-burgundy hover:underline"
          >
            View site
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Clock,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { CONTACT } from "@/lib/data/fallback";
import { formatPhone } from "@/lib/utils/format";
import { formatShiftDisplay } from "@/lib/utils/store-hours";
import { cn } from "@/lib/utils/cn";

const EXPLORE = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/deals", label: "Deals" },
  { href: "/pre-order", label: "Pre Order" },
  { href: "/about", label: "About" },
];

const HELP = [
  { href: "/contact", label: "Contact" },
  { href: "/track-order", label: "Track Order" },
  { href: "/faqs", label: "FAQs" },
  { href: "/testimonials", label: "Testimonials" },
];

const LEGAL = [
  { href: "/privacy-policy", label: "Privacy Policy" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1 text-[14px] text-cream/80 transition hover:text-gold"
    >
      <span>{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-gold/70 opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}

function ColumnTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <h3 className="font-display mb-5 flex items-center gap-2 text-[17px] font-bold text-gold">
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </h3>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [contact, setContact] = useState({
    phone: CONTACT.phone,
    email: CONTACT.email,
    whatsapp: CONTACT.whatsapp,
    address: "",
    city: "Islamabad",
    instagram: "",
  });

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        if (!s || s.error) return;
        setContact({
          phone: s.phone || CONTACT.phone,
          email: s.email || CONTACT.email,
          whatsapp: s.whatsappNumber || CONTACT.whatsapp,
          address: s.address || "",
          city: s.city || "Islamabad",
          instagram: s.socialLinks?.instagram || "",
        });
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("You're on the list!", {
      description: "We'll share tasty updates & offers soon.",
    });
    setEmail("");
    setSending(false);
  };

  return (
    <footer className="relative mt-auto overflow-hidden text-cream">
      {/* Smooth wave top — cream page peels away into burgundy */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 -mt-px h-12 sm:h-14" aria-hidden>
        <svg
          viewBox="0 0 1440 56"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            fill="#FFF4DA"
            d="M0,0 L1440,0 L1440,18
               C1320,42 1200,8 1080,28
               C960,48 840,10 720,30
               C600,50 480,12 360,32
               C240,52 120,14 0,34
               Z"
          />
        </svg>
      </div>

      {/* Background — image cream band cropped */}
      <div className="absolute inset-0 overflow-hidden bg-[#4a0a10]">
        <Image
          src="/images/brand/footer-bg.png"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="origin-bottom scale-[1.22] object-cover object-[center_88%]"
        />
        <div className="absolute inset-0 bg-[#4a0a10]/28" aria-hidden />
        <div
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#4a0a10] via-[#4a0a10]/85 to-transparent"
          aria-hidden
        />
      </div>

      {/* Soft watermark script */}
      <p
        className="pointer-events-none absolute left-1/2 top-[28%] z-[1] -translate-x-1/2 select-none font-script text-[clamp(3rem,12vw,9rem)] leading-none text-cream/[0.06]"
        aria-hidden
      >
        Yummilicious
      </p>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:px-8 sm:pt-20 lg:px-10 lg:pt-20">
        {/* Main columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center text-center sm:col-span-2 lg:col-span-3">
            <Logo
              size={120}
              href="/"
              className="drop-shadow-lg [&_img]:!h-[4.5rem] [&_img]:!w-[4.5rem] sm:[&_img]:!h-[7.5rem] sm:[&_img]:!w-[7.5rem]"
            />
            <p className="font-display mt-5 text-lg font-bold leading-snug text-gold sm:text-xl">
              Homemade Comfort.
              <br />
              Unforgettable Flavour.
            </p>
            <p className="mt-3 max-w-[250px] text-sm leading-relaxed text-cream/70">
              Freshly prepared favourites made with homemade care.
            </p>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <ColumnTitle icon={Leaf}>Explore</ColumnTitle>
            <ul className="space-y-3">
              {EXPLORE.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="lg:col-span-2">
            <ColumnTitle icon={MessageCircle}>Help</ColumnTitle>
            <ul className="space-y-3">
              {HELP.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <ColumnTitle icon={Shield}>Legal</ColumnTitle>
            <ul className="space-y-3">
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-3">
            <ColumnTitle icon={Mail}>Stay in the Loop</ColumnTitle>
            <p className="mb-4 text-sm leading-relaxed text-cream/70">
              Subscribe for tasty updates, exclusive offers & fresh new arrivals.
            </p>
            <form onSubmit={handleSubscribe} className="relative max-w-sm">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                suppressHydrationWarning
                className="focus-ring w-full rounded-full border border-cream/20 bg-[#FFF4DA] py-3.5 pl-5 pr-14 text-base text-brown placeholder:text-brown/45 sm:text-sm"
              />
              <button
                type="submit"
                disabled={sending}
                aria-label="Subscribe"
                suppressHydrationWarning
                className={cn(
                  "focus-ring absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-orange text-cream shadow-md transition hover:bg-gold",
                  sending && "opacity-70"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.instagram.com/yummilicious.pk/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @yummilicious.pk"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-cream/85 transition hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2zm6.1-8.1a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0zM12 2.5c-2.6 0-2.9 0-3.9.06-1.98.09-3.65 1.74-3.74 3.74C4.3 7.4 4.3 7.7 4.3 10.3s0 2.9.06 3.9c.09 1.98 1.74 3.65 3.74 3.74 1 .05 1.3.06 3.9.06s2.9 0 3.9-.06c1.98-.09 3.65-1.74 3.74-3.74.05-1 .06-1.3.06-3.9s0-2.9-.06-3.9c-.09-1.98-1.74-3.65-3.74-3.74-1-.05-1.3-.06-3.9-.06zm0 15.4c-2.55 0-2.85 0-3.85-.06-1.5-.07-2.74-1.3-2.8-2.8-.06-1-.06-1.3-.06-3.85s0-2.85.06-3.85c.07-1.5 1.3-2.74 2.8-2.8 1-.06 1.3-.06 3.85-.06s2.85 0 3.85.06c1.5.07 2.74 1.3 2.8 2.8.06 1 .06 1.3.06 3.85s0 2.85-.06 3.85c-.07 1.5-1.3 2.74-2.8 2.8-1 .06-1.3.06-3.85.06z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/__yummilicious___/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @__yummilicious___"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-cream/85 transition hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                  <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2zm6.1-8.1a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0zM12 2.5c-2.6 0-2.9 0-3.9.06-1.98.09-3.65 1.74-3.74 3.74C4.3 7.4 4.3 7.7 4.3 10.3s0 2.9.06 3.9c.09 1.98 1.74 3.65 3.74 3.74 1 .05 1.3.06 3.9.06s2.9 0 3.9-.06c1.98-.09 3.65-1.74 3.74-3.74.05-1 .06-1.3.06-3.9s0-2.9-.06-3.9c-.09-1.98-1.74-3.65-3.74-3.74-1-.05-1.3-.06-3.9-.06zm0 15.4c-2.55 0-2.85 0-3.85-.06-1.5-.07-2.74-1.3-2.8-2.8-.06-1-.06-1.3-.06-3.85s0-2.85.06-3.85c.07-1.5 1.3-2.74 2.8-2.8 1-.06 1.3-.06 3.85-.06s2.85 0 3.85.06c1.5.07 2.74 1.3 2.8 2.8.06 1 .06 1.3.06 3.85s0 2.85-.06 3.85c-.07 1.5-1.3 2.74-2.8 2.8-1 .06-1.3.06-3.85.06z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-cream/85 transition hover:border-gold hover:bg-gold/10 hover:text-gold"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact bar — glass strip like SS2 */}
        <div className="mt-12 rounded-2xl border border-gold/25 bg-cream/[0.07] px-4 py-4 backdrop-blur-[2px] sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-gold/20">
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-2 text-sm text-cream/85 transition hover:text-gold lg:justify-center"
            >
              <Phone className="h-4 w-4 shrink-0 text-gold" />
              <span>{formatPhone(contact.phone)}</span>
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 px-2 text-sm text-cream/85 transition hover:text-gold lg:justify-center"
            >
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate">{contact.email}</span>
            </a>
            <div className="flex items-center gap-3 px-2 text-sm text-cream/85 lg:justify-center">
              <MapPin className="h-4 w-4 shrink-0 text-gold" />
              <span>{contact.address || contact.city || "Delivery Areas at Checkout"}</span>
            </div>
            <div className="flex items-center gap-3 px-2 text-sm text-cream/85 lg:justify-center">
              <Clock className="h-4 w-4 shrink-0 text-gold" />
              <span className="min-w-0 break-words text-left leading-snug lg:text-center">
                Daily · {formatShiftDisplay()}
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gold/20 pt-6 sm:flex-row">
          <p className="text-xs text-cream/55">
            © {new Date().getFullYear()} Yummilicious. All rights reserved.
          </p>
          <p className="text-xs text-cream/55">
            Made fresh. Served with love.{" "}
            <span className="text-orange" aria-hidden>
              ♥
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

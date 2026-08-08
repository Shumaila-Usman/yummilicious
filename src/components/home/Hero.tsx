"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Heart,
  Leaf,
  Utensils,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/uploads/types";

const TRUST = [
  { label: "Freshly Prepared", icon: Leaf, tone: "text-green" },
  { label: "Made to Order", icon: ChefHat, tone: "text-green" },
  { label: "Homemade with Care", icon: Heart, tone: "text-orange" },
];

export type HeroContent = {
  eyebrow?: string;
  headline?: string;
  subcopy?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  image?: string;
};

export function Hero({ content }: { content?: HeroContent }) {
  const eyebrow = content?.eyebrow || "Homemade • Fresh • Full of Flavour";
  const headline = content?.headline || "Homemade Flavour, Made to Make You Smile.";
  const subcopy =
    content?.subcopy ||
    "From comforting breakfasts to generously filled shawarmas and paratha rolls, every order is freshly prepared with homemade care.";
  const ctaPrimary = content?.ctaPrimary || "Order Your Favourites";
  const ctaSecondary = content?.ctaSecondary || "Explore the Menu";
  const image = resolveMediaUrl(
    content?.image || "/images/hero/hero-bg.png",
    "/images/hero/hero-bg.png"
  );

  // Split headline for orange accent on last sentence fragment if present
  const smileMatch = headline.match(/^(.*?)(Make You Smile\.?)$/i);
  const headlineMain = smileMatch ? smileMatch[1].trim() : headline;
  const headlineAccent = smileMatch ? smileMatch[2] : "";

  return (
    <section className="relative -mt-[3.5rem] min-h-[100svh] overflow-hidden max-[390px]:min-h-0 sm:-mt-[5.25rem]">
      <div className="absolute inset-0 bg-[#FFF8E8]">
        <Image
          src={image}
          alt="Yummilicious homemade platter"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[70%_center] brightness-[1.18] contrast-[1.02] saturate-[1.08] max-[430px]:object-[75%_32%] max-[480px]:object-[78%_40%] sm:object-[65%_center] lg:object-center"
          unoptimized={image.startsWith("/api/uploads/")}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#FFF8E8]/90 via-[#FFF8E8]/50 to-transparent max-lg:via-[#FFF8E8]/60 lg:from-[#FFF8E8]/65 lg:via-[#FFF8E8]/20 lg:to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] items-center px-4 pb-10 pt-20 max-[390px]:min-h-0 max-[390px]:pb-8 max-[390px]:pt-16 sm:px-8 sm:pb-14 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36">
        <div className="w-full max-w-[34rem] lg:max-w-[36rem]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown/60 sm:text-xs sm:tracking-[0.28em]"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-3 text-[1.7rem] font-extrabold leading-[1.15] tracking-tight text-[#351A12] max-[360px]:text-[1.55rem] sm:mt-6 sm:text-[3.1rem] lg:text-[3.45rem]"
          >
            {headlineMain}{" "}
            {headlineAccent ? (
              <span className="relative inline text-orange sm:whitespace-nowrap">
                {headlineAccent}
              </span>
            ) : null}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.55 }}
            className="mt-4 max-w-[28rem] text-[14px] leading-[1.65] text-brown/70 sm:mt-6 sm:text-base"
          >
            {subcopy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5"
          >
            <Link
              href="/menu"
              className="focus-ring group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-burgundy px-5 text-[13px] font-bold text-cream shadow-[0_14px_34px_-10px_rgba(158,11,24,0.55)] transition hover:bg-burgundy-dark sm:h-[3.15rem] sm:w-auto sm:px-7 sm:text-[15px]"
            >
              <Utensils className="h-4 w-4 opacity-90" aria-hidden />
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/menu"
              className="focus-ring group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#351A12]/20 bg-cream/70 px-5 text-[13px] font-bold text-[#351A12] backdrop-blur-sm transition hover:border-burgundy hover:text-burgundy sm:h-[3.15rem] sm:w-auto sm:px-7 sm:text-[15px]"
            >
              <BookOpen className="h-4 w-4 text-orange" aria-hidden />
              {ctaSecondary}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mt-6 hidden flex-wrap gap-2 sm:mt-10 sm:flex sm:gap-2.5"
          >
            {TRUST.map(({ label, icon: Icon, tone }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/55 px-3.5 py-2.5 text-[12px] font-semibold text-brown/80 shadow-sm backdrop-blur-md sm:text-[13px]"
              >
                <Icon className={`h-4 w-4 ${tone}`} aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

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

const TRUST = [
  { label: "Freshly Prepared", icon: Leaf, tone: "text-green" },
  { label: "Made to Order", icon: ChefHat, tone: "text-green" },
  { label: "Homemade with Care", icon: Heart, tone: "text-orange" },
];

export function Hero() {
  return (
    <section className="relative -mt-[3.5rem] min-h-[100svh] overflow-hidden max-[390px]:min-h-0 sm:-mt-[5.25rem]">
      {/* SS2 — full-bleed hero background */}
      <div className="absolute inset-0 bg-[#FFF8E8]">
        <Image
          src="/images/hero/hero-bg.png"
          alt="Yummilicious homemade platter with shawarma, sandwich, fried egg and chai"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover object-[70%_center] brightness-[1.18] contrast-[1.02] saturate-[1.08] max-[430px]:object-[75%_32%] max-[480px]:object-[78%_40%] sm:object-[65%_center] lg:object-center"
        />
        {/* Soft left readability veil — lighter so the scene stays bright */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#FFF8E8]/90 via-[#FFF8E8]/50 to-transparent max-lg:via-[#FFF8E8]/60 lg:from-[#FFF8E8]/65 lg:via-[#FFF8E8]/20 lg:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#FFF8E8]/35 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FFF8E8]/20 to-transparent lg:hidden"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] items-center px-4 pb-10 pt-20 max-[390px]:min-h-0 max-[390px]:pb-8 max-[390px]:pt-16 sm:px-8 sm:pb-14 sm:pt-32 lg:px-12 lg:pb-20 lg:pt-36">
        {/* Left content — matches design mockup */}
        <div className="w-full max-w-[34rem] lg:max-w-[36rem]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-brown/60 sm:text-xs sm:tracking-[0.28em]"
          >
            Homemade <span className="text-burgundy/45">•</span> Fresh{" "}
            <span className="text-orange">• Full of Flavour</span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-3 text-[1.7rem] font-extrabold leading-[1.15] tracking-tight text-[#351A12] max-[360px]:text-[1.55rem] sm:mt-6 sm:text-[3.1rem] lg:text-[3.45rem]"
          >
            Homemade Flavour, Made to{" "}
            <span className="relative inline text-orange sm:whitespace-nowrap">
              Make You Smile.
              <svg
                className="absolute -right-2 -top-0.5 h-3.5 w-3.5 text-burgundy sm:-right-7 sm:h-5 sm:w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M7 3c1.2 2.4 1.5 4.2.8 5.8C9.5 8.2 11 7.5 13 7c-1.8 1.6-2.6 3.4-2.2 5.4 2.2-1 4-1.2 6-1-2.2 1.4-3.4 3-3.6 5 .8-1 2-1.6 3.6-1.8-1 .8-1.6 2-1.8 3.4C17 14 19 11.5 20 8c-2.2.4-4-.2-5.5-1.5C15.2 4.2 13.5 3 11 2.5 9.8 3.8 8.5 4 7 3z" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.55 }}
            className="mt-4 max-w-[28rem] text-[14px] leading-[1.65] text-brown/70 sm:mt-6 sm:text-base"
          >
            From comforting breakfasts to generously filled shawarmas and
            paratha rolls, every order is freshly prepared with homemade care.
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
              Order Your Favourites
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/menu"
              className="focus-ring group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#351A12]/20 bg-cream/70 px-5 text-[13px] font-bold text-[#351A12] backdrop-blur-sm transition hover:border-burgundy hover:text-burgundy sm:h-[3.15rem] sm:w-auto sm:px-7 sm:text-[15px]"
            >
              <BookOpen className="h-4 w-4 text-orange" aria-hidden />
              Explore the Menu
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

      {/* Stamp badges over food — desktop/tablet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -18 }}
        animate={{ opacity: 1, scale: 1, rotate: -12 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 180 }}
        className="pointer-events-none absolute right-[5%] top-[24%] z-20 hidden sm:block lg:right-[7%] lg:top-[22%]"
        aria-hidden
      >
        <div className="flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border-[2.5px] border-dashed border-burgundy bg-cream/92 text-center shadow-warm backdrop-blur-sm lg:h-[5.75rem] lg:w-[5.75rem]">
          <span className="font-script px-1 text-[15px] leading-tight text-burgundy lg:text-[17px]">
            100%
            <br />
            Homemade
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: 16 }}
        animate={{ opacity: 1, scale: 1, rotate: 10 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 180 }}
        className="pointer-events-none absolute bottom-[16%] right-[10%] z-20 hidden sm:block lg:bottom-[14%] lg:right-[12%]"
        aria-hidden
      >
        <div className="flex h-[5rem] w-[5rem] items-center justify-center rounded-full border-[2.5px] border-dashed border-burgundy/85 bg-cream/92 text-center shadow-warm backdrop-blur-sm lg:h-[5.5rem] lg:w-[5.5rem]">
          <span className="font-script px-1 text-[15px] leading-tight text-burgundy lg:text-[17px]">
            Freshly
            <br />
            Prepared
          </span>
        </div>
      </motion.div>
    </section>
  );
}

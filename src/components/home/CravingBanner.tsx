"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Tag, UtensilsCrossed } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function CravingBanner() {
  return (
    <section className="relative bg-cream px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <ScrollReveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#FFF8EC] shadow-[0_28px_70px_-28px_rgba(158,11,24,0.4)] ring-1 ring-burgundy/10 sm:rounded-[2rem]">
          {/* Warm right backdrop — desktop only */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-gradient-to-br from-[#E8C9A0] via-[#D4A574] to-[#B86B3A] lg:block"
            aria-hidden
          />
          {/* Sauce swirl divider — desktop only */}
          <div className="pointer-events-none absolute inset-y-0 left-[38%] right-0 z-[1] hidden lg:block" aria-hidden>
            <svg
              viewBox="0 0 600 500"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M40,0 C120,80 60,160 140,220 C220,280 80,340 160,400 C210,440 90,470 40,500 L40,500 L0,500 L0,0 Z"
                fill="#FFF8EC"
              />
              <path
                d="M55,0 C150,90 70,170 165,240 C250,300 95,350 180,420 C230,460 110,485 60,500"
                fill="none"
                stroke="#F28C00"
                strokeWidth="28"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M75,20 C160,100 95,175 175,245 C255,310 115,355 195,425"
                fill="none"
                stroke="#9E0B18"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.75"
              />
              <path
                d="M95,40 C155,110 115,180 185,250 C240,300 140,360 200,410"
                fill="none"
                stroke="#F6B53A"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </div>

          <div className="relative z-10 grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
            {/* Left cream panel */}
            <div className="relative z-20 flex flex-col justify-center bg-[#FFF8EC] px-5 py-8 sm:px-10 sm:py-12 lg:bg-transparent lg:py-14 lg:pl-12 lg:pr-6 xl:pl-14">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="font-display max-w-[15ch] text-[1.65rem] font-extrabold leading-[1.14] tracking-tight text-[#3D1A14] sm:text-[2.4rem] lg:text-[2.7rem]"
              >
                Your Next Craving Is Only a{" "}
                <span className="relative text-orange">
                  Click Away.
                  <svg
                    className="absolute -right-5 top-1 h-3.5 w-3.5 text-burgundy sm:-right-6 sm:h-4 sm:w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <circle cx="5" cy="12" r="2.2" />
                    <circle cx="12" cy="12" r="2.2" />
                    <circle cx="19" cy="12" r="2.2" />
                  </svg>
                </span>
              </motion.h2>

              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-brown/65 sm:mt-5 sm:text-base">
                Freshly prepared homemade favourites, delivered with flavour.
              </p>

              <div className="mt-7 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <Link
                  href="/menu"
                  className="focus-ring group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-burgundy px-5 text-sm font-bold text-cream shadow-[0_12px_28px_-10px_rgba(158,11,24,0.55)] transition hover:bg-burgundy-dark sm:h-12 sm:w-auto sm:px-6"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-brown">
                    <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  Start Your Order
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/deals"
                  className="focus-ring group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-brown/20 bg-[#FFF8EC] px-5 text-sm font-bold text-brown transition hover:border-burgundy hover:text-burgundy sm:h-12 sm:w-auto sm:px-6"
                >
                  <Tag className="h-4 w-4 text-orange" aria-hidden />
                  View Today&apos;s Deals
                  <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Spice accents */}
              <div
                className="pointer-events-none mt-8 flex items-end gap-2 opacity-70"
                aria-hidden
              >
                <span className="text-lg text-green">🌿</span>
                <span className="mb-1 h-1.5 w-1.5 rounded-full bg-brown/50" />
                <span className="mb-0.5 h-1 w-1 rounded-full bg-burgundy/60" />
                <span className="h-1.5 w-1.5 rounded-full bg-orange/70" />
              </div>
            </div>

            {/* Right thaali — cutout, no black studio backdrop */}
            <div className="relative z-[2] min-h-[180px] overflow-hidden sm:min-h-[360px] lg:min-h-[500px]">
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center p-3 sm:p-4 lg:p-3"
              >
                <div className="relative aspect-square w-full max-w-md scale-100 sm:w-[115%] sm:max-w-[660px] lg:max-w-[700px] lg:scale-110">
                  <Image
                    src="/images/home/thaali-cutout.png"
                    alt="Yummilicious thaali with wraps, sandwich, fried egg and chai"
                    fill
                    sizes="(max-width: 1024px) 95vw, 700px"
                    className="object-contain object-center drop-shadow-[0_28px_50px_rgba(53,26,18,0.35)]"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Smooth zig-zag / wave bottom bar */}
          <div className="relative z-20 h-8 sm:h-10" aria-hidden>
            <svg
              viewBox="0 0 1440 40"
              className="absolute inset-x-0 bottom-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <path
                fill="#5C0A12"
                d="M0,18 C120,34 240,6 360,20 C480,34 600,8 720,22 C840,36 960,10 1080,24 C1200,38 1320,12 1440,26 L1440,40 L0,40 Z"
              />
            </svg>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

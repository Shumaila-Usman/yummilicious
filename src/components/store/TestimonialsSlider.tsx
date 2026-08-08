"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

type Item = {
  _id: string;
  name: string;
  quote: string;
  role?: string;
  photo?: string;
  rating: number;
};

export function TestimonialsSlider({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  if (!items.length) {
    return <p className="text-center text-muted">No testimonials yet.</p>;
  }

  const current = items[index % items.length];
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={current._id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-burgundy/10 bg-cream px-6 py-10 text-center shadow-warm sm:px-12"
        >
          <div className="mb-4 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < current.rating ? "fill-orange text-orange" : "text-burgundy/20"
                }`}
              />
            ))}
          </div>
          <p className="font-display text-xl leading-relaxed text-brown sm:text-2xl">
            &ldquo;{current.quote}&rdquo;
          </p>
          <footer className="mt-6">
            <p className="font-bold text-burgundy">{current.name}</p>
            {current.role && <p className="text-sm text-muted">{current.role}</p>}
          </footer>
        </motion.blockquote>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="rounded-full border border-burgundy/20 bg-white p-2 text-burgundy hover:bg-burgundy hover:text-cream"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-muted">
            {index + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="rounded-full border border-burgundy/20 bg-white p-2 text-burgundy hover:bg-burgundy hover:text-cream"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

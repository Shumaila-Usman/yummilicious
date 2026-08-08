"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Item = { _id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?._id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = open === item._id;
        return (
          <div
            key={item._id}
            className="rounded-2xl border border-burgundy/10 bg-cream overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item._id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-display font-bold text-brown">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-burgundy transition",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-burgundy/10 px-5 py-4 text-sm leading-relaxed text-muted">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

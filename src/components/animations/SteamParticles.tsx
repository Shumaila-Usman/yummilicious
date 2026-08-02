"use client";

import { cn } from "@/lib/utils/cn";

interface SteamParticlesProps {
  count?: number;
  className?: string;
}

export function SteamParticles({ count = 8, className }: SteamParticlesProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="steam-particle absolute bottom-0 rounded-full bg-gradient-to-t from-transparent via-cream/40 to-cream/70 blur-[2px]"
          style={{
            left: `${10 + (i * 80) / count}%`,
            width: `${8 + (i % 3) * 4}px`,
            height: `${24 + (i % 4) * 8}px`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 3) * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

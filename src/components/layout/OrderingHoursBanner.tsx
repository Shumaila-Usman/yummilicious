"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import {
  getOrderingHoursMessage,
  DEFAULT_SHIFTS,
} from "@/lib/utils/store-hours";
import type { StoreHoursShift } from "@/types";

export function OrderingHoursBanner({
  shifts = DEFAULT_SHIFTS,
}: {
  shifts?: StoreHoursShift[];
}) {
  const [info, setInfo] = useState(() => getOrderingHoursMessage(shifts));

  useEffect(() => {
    const tick = () => setInfo(getOrderingHoursMessage(shifts));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [shifts]);

  return (
    <div
      role="status"
      className={
        info.open
          ? "relative z-[60] bg-burgundy text-cream"
          : "relative z-[60] bg-burgundy-dark text-cream"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-center text-xs font-medium tracking-wide sm:px-4 sm:py-2.5 sm:pt-[max(0.625rem,env(safe-area-inset-top))] sm:text-sm">
        {info.open ? (
          <>
            <Leaf className="hidden h-3.5 w-3.5 shrink-0 text-gold sm:block" aria-hidden />
            <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>Freshly Made</span>
              <span className="text-gold/80" aria-hidden>
                •
              </span>
              <span>Homemade With Care</span>
              <span className="text-gold/80" aria-hidden>
                •
              </span>
              <span>Delivered With Flavour</span>
            </p>
            <Leaf className="hidden h-3.5 w-3.5 shrink-0 text-gold sm:block" aria-hidden />
          </>
        ) : (
          <p className="line-clamp-2 px-1 leading-snug sm:line-clamp-none">
            <span className="font-semibold">Ordering paused</span>
            {" · "}
            {info.message}
          </p>
        )}
      </div>
    </div>
  );
}

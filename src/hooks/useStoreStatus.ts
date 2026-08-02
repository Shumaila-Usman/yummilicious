"use client";

import { useCallback, useEffect, useState } from "react";
import type { StoreHoursShift } from "@/types";
import { DEFAULT_SHIFTS } from "@/lib/utils/store-hours";

export interface StoreStatus {
  open: boolean;
  storeOpen: boolean;
  withinHours: boolean;
  message: string;
  shifts: StoreHoursShift[];
  shiftDisplay: string;
  estimatedPrepTime: number;
  minimumOrderValue: number;
  loading: boolean;
}

const DEFAULT_STATUS: StoreStatus = {
  open: false,
  storeOpen: true,
  withinHours: false,
  message: "Checking store hours…",
  shifts: DEFAULT_SHIFTS,
  shiftDisplay: "9:00 AM – 12:00 PM & 8:00 PM – 11:00 PM",
  estimatedPrepTime: 30,
  minimumOrderValue: 300,
  loading: true,
};

export function useStoreStatus(pollMs = 30_000) {
  const [status, setStatus] = useState<StoreStatus>(DEFAULT_STATUS);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/store-status", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStatus({
        open: data.open ?? false,
        storeOpen: data.storeOpen ?? true,
        withinHours: data.withinHours ?? false,
        message: data.message ?? "",
        shifts: data.shifts ?? DEFAULT_SHIFTS,
        shiftDisplay: data.shiftDisplay ?? "",
        estimatedPrepTime: data.estimatedPrepTime ?? 30,
        minimumOrderValue: data.minimumOrderValue ?? 300,
        loading: false,
      });
    } catch {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        message: "Unable to verify store hours. Please try again.",
      }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, pollMs);
    return () => clearInterval(id);
  }, [fetchStatus, pollMs]);

  return { ...status, refresh: fetchStatus };
}

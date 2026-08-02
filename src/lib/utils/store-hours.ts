import type { StoreHoursShift } from "@/types";

/** Default Yummilicious ordering windows (Asia/Karachi) */
export const DEFAULT_SHIFTS: StoreHoursShift[] = [
  { label: "Morning", start: "09:00", end: "12:00" },
  { label: "Evening", start: "20:00", end: "23:00" },
];

const TZ = "Asia/Karachi";

function getKarachiParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((p) => [p.type, p.value])
  );
  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    weekday: parts.weekday,
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isWithinOrderingHours(
  shifts: StoreHoursShift[] = DEFAULT_SHIFTS,
  now = new Date()
): boolean {
  const { hour, minute } = getKarachiParts(now);
  const current = hour * 60 + minute;

  return shifts.some((shift) => {
    const start = toMinutes(shift.start);
    const end = toMinutes(shift.end);
    return current >= start && current < end;
  });
}

export function getActiveShift(
  shifts: StoreHoursShift[] = DEFAULT_SHIFTS,
  now = new Date()
): StoreHoursShift | null {
  const { hour, minute } = getKarachiParts(now);
  const current = hour * 60 + minute;

  return (
    shifts.find((shift) => {
      const start = toMinutes(shift.start);
      const end = toMinutes(shift.end);
      return current >= start && current < end;
    }) ?? null
  );
}

export function getNextShiftOpen(
  shifts: StoreHoursShift[] = DEFAULT_SHIFTS,
  now = new Date()
): { shift: StoreHoursShift; label: string } | null {
  if (isWithinOrderingHours(shifts, now)) return null;

  const { hour, minute } = getKarachiParts(now);
  const current = hour * 60 + minute;
  const sorted = [...shifts].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start)
  );

  for (const shift of sorted) {
    if (current < toMinutes(shift.start)) {
      return {
        shift,
        label: `Opens at ${formatTime12(shift.start)} (${shift.label})`,
      };
    }
  }

  const first = sorted[0];
  if (!first) return null;
  return {
    shift: first,
    label: `Opens tomorrow at ${formatTime12(first.start)} (${first.label})`,
  };
}

export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatShiftDisplay(shifts: StoreHoursShift[] = DEFAULT_SHIFTS): string {
  return shifts
    .map((s) => `${formatTime12(s.start)} – ${formatTime12(s.end)}`)
    .join(" & ");
}

export function getOrderingHoursMessage(
  shifts: StoreHoursShift[] = DEFAULT_SHIFTS,
  now = new Date()
): { open: boolean; message: string; shift: StoreHoursShift | null } {
  const active = getActiveShift(shifts, now);
  if (active) {
    return {
      open: true,
      shift: active,
      message: `We're open! Ordering until ${formatTime12(active.end)}.`,
    };
  }
  const next = getNextShiftOpen(shifts, now);
  return {
    open: false,
    shift: null,
    message: next
      ? `We're currently closed. ${next.label}. Ordering hours: ${formatShiftDisplay(shifts)}.`
      : `We're currently closed. Ordering hours: ${formatShiftDisplay(shifts)}.`,
  };
}

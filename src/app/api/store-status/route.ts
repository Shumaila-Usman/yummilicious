import { NextResponse } from "next/server";
import {
  isWithinOrderingHours,
  getOrderingHoursMessage,
  formatShiftDisplay,
  DEFAULT_SHIFTS,
} from "@/lib/utils/store-hours";
import { getSettingsDoc, serialize } from "@/lib/api/helpers";

export async function GET() {
  try {
    const settings = await getSettingsDoc();
    const shifts = settings.businessHours?.length ? settings.businessHours : DEFAULT_SHIFTS;
    const withinHours = isWithinOrderingHours(shifts);
    const hoursMessage = getOrderingHoursMessage(shifts);

    const open = settings.storeOpen && withinHours;

    return NextResponse.json(
      serialize({
        open,
        storeOpen: settings.storeOpen,
        withinHours,
        message: settings.storeOpen
          ? hoursMessage.message
          : "The store is temporarily closed. Please check back later.",
        shifts,
        shiftDisplay: formatShiftDisplay(shifts),
        activeShift: hoursMessage.shift,
        estimatedPrepTime: settings.estimatedPrepTime,
        minimumOrderValue: settings.minimumOrderValue,
      })
    );
  } catch (error) {
    console.error("GET /api/store-status:", error);
    return NextResponse.json({ error: "Failed to fetch store status" }, { status: 500 });
  }
}

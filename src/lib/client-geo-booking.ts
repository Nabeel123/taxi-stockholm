/** Optional device timezone hint for `/api/booking-submission` (no location / region / country collected). */

export type BookingClientTimezoneHint = {
  timezone?: string;
};

export function getBookingClientTimezoneHint(): BookingClientTimezoneHint {
  if (typeof window === "undefined") return {};
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    return tz ? { timezone: tz.slice(0, 128) } : {};
  } catch {
    return {};
  }
}

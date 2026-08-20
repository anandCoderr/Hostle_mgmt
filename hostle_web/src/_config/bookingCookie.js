import Cookies from "js-cookie";
import { decryptData, encryptData } from "./encryption";

// Cookie that holds the user's in-progress booking selection. Read back on the
// intake form / payment step so the flow knows what was chosen.
export const BOOKING_COOKIE_NAME = "bookingTimeAndDate";

// Platform fee is a fixed, constant charge. It lives here (not inside the
// per-booking payload) so the summary UI and the stored cookie always agree and
// there is a single place to change it.
export const PLATFORM_FEE = 150;

// We want the booking selection to live for exactly 1 hour and then be dropped
// automatically by the browser. js-cookie's `expires` takes a number of days,
// so 1 hour = 1/24 of a day.
const ONE_HOUR_IN_DAYS = 1 / 24;

const COOKIE_OPTIONS = {
  expires: ONE_HOUR_IN_DAYS,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// Persist the (encrypted) booking selection for 1 hour.
export const storeBookingDetails = (details) =>
  Cookies.set(BOOKING_COOKIE_NAME, encryptData(details), COOKIE_OPTIONS);

// Read + decrypt the booking selection (null if absent/expired).
export const getBookingDetails = () => {
  const raw = Cookies.get(BOOKING_COOKIE_NAME);
  return raw ? decryptData(raw) : null;
};

export const removeBookingDetails = () =>
  Cookies.remove(BOOKING_COOKIE_NAME, { path: COOKIE_OPTIONS.path });

// ---------------------------------------------------------------------------
// Confirmed-booking summary handed from the intake form to the confirmation
// page after a successful (or zero-amount) booking. Lives in sessionStorage —
// it's only needed for the current tab/session and should not survive a close.
const CONFIRMED_BOOKING_KEY = "sahaConfirmedBooking";

export const storeConfirmedBooking = (summary) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONFIRMED_BOOKING_KEY, JSON.stringify(summary || {}));
};

export const getConfirmedBooking = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONFIRMED_BOOKING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const removeConfirmedBooking = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONFIRMED_BOOKING_KEY);
};

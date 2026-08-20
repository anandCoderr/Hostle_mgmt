"use server";

// USE WHEN: set/read/delete httpOnly cookies from the server — the browser cannot read these.

import { cookies } from "next/headers";
import { authCookie, cookieMaxAge } from "./configConst";
import { logger } from "@/utils/logger";

const COOKIE_OPTIONS = {
  maxAge: cookieMaxAge.sevenDays,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  httpOnly: true,
};

// ---------convert to string formate

const toJsonStringify = (value) => JSON.stringify(value);

// -----------convert to

const toJsonParse = (value) => JSON.parse(value);

// ----------------------set cookie without encryption

export const setNonEncryptedCookies = async (
  name = authCookie?.token,
  value,
  options = {},
) => {
  (await cookies()).set(name, toJsonStringify(value), {
    ...COOKIE_OPTIONS,
    ...options,
  });
};

// ----------------------set cookie
// Identical to setNonEncryptedCookies now that encryption is gone. Both names
// are kept so existing call sites keep working.

export const setCookies = async (
  name = authCookie?.token,
  value,
  options = {},
) => {
  (await cookies()).set(name, toJsonStringify(value), {
    ...COOKIE_OPTIONS,
    ...options,
  });
};

// ---------------------------- getNonEncryptedCookies

export const getNonEncryptedCookies = async (name = authCookie?.token) => {
  const cookie = (await cookies()).get(name);

  // get('name')	- Object - It Accepts a cookie name and returns an object with the name and value.

  if (!cookie) return null;
  return cookie.value;
};

// ------------------it returns selected cookie value
// Returns the PARSED value (getNonEncryptedCookies returns the raw string) —
// same contract the decrypting version had, so callers are unaffected.

export const getCookies = async (name = authCookie?.token) => {
  const cookie = (await cookies()).get(name);

  // get('name')	- Object - It Accepts a cookie name and returns an object with the name and value.

  if (!cookie) return null;
  try {
    return toJsonParse(cookie.value);
  } catch {
    return cookie.value;
  }
};

// ------------------ remove single cookie

export const removeSingleCookies = async (value) => {
  (await cookies()).delete(value);
};

// -----------------------it removes every cookie that currently exists
export const removeAllCookies = async () => {
  const store = await cookies();
  // Delete the cookies actually present — not just the ones hardcoded in
  // `allCookies` — so stale/renamed keys are cleared too.
  store.getAll().forEach(({ name }) => store.delete(name));
};

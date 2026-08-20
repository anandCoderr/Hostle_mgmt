"use server";

// USE WHEN: reading a cookie from anywhere — safe to import in a client component, runs on the server.

import { getCookies } from "./cookieOperations";

/**
 * getCookie — read ANY cookie by name, from ANYWHERE (client or server).
 *
 * This is a `"use server"` module, so its export is a **server action**: a
 * client component can import and call `getCookie()` directly and it runs on
 * the server — reading the httpOnly cookie, JSON-parsing it, and returning the
 * value. On the server you call it exactly the same way.
 *
 * It delegates to the low-level `getCookies` in `cookieOperations.js`
 * (single source of truth for the actual read logic).
 *
 * @param {string} name  cookie key — see `@/_config/cookie/configConst`.
 * @returns the JSON-parsed value, or `null` if the cookie is absent.
 *
 * @example  // works in a client component OR a server action/component
 *   import { getCookie } from "@/_config/cookie/getCookie";
 *   import { normalCookie } from "@/_config/cookie/configConst";
 *
 *   const info = await getCookie(normalCookie.signupStep1EmailOrPhone);
 *   // info = { type, target, expiresAt, countryCode } | null
 */
export const getCookie = async (name) => {
  if (!name) return null;
  return await getCookies(name);
};

// USE WHEN: client-side, logged-in user — JWT from cookie → Authorization header; 401/403/419 logs the user out.

// import Cookies from "js-cookie";
// import { buildQuery, queryStringToJSON } from "./queryString";
// // import { logger } from "@/utils/logger";
// import { authCookie } from "./cookie/configConst";

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export const TOKEN_KEYS = {
//   token: "saha_soul_web_user_token",
//   detail: "saha_soul_web_user_details",
//   permission: "garden_go_admin-permission",
//   // -------need to find who
//   signUpCred: "signup-cred",
//   loginWithPhoe: "loginPhonePayload",
// };

// export const AUTH_CHANGED_EVENT = "saha-soul-auth-changed";

// export const notifyAuthChanged = () => {
//   if (typeof window !== "undefined") {
//     window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
//   }
// };

// const COOKIE_OPTIONS = {
//   expires: 7,
//   sameSite: "lax",
//   secure: process.env.NODE_ENV === "production",
//   path: "/",
// };

// export const getToken = () => Cookies.get(authCookie.token) || null;

// export const setToken = (token, options) =>
//   Cookies.set(TOKEN_KEYS.token, token, { ...COOKIE_OPTIONS, ...options });

// export const removeToken = () => {
//   Object.values(TOKEN_KEYS).forEach((k) =>
//     Cookies.remove(k, { path: COOKIE_OPTIONS.path }),
//   );
// };

// // Cookie values are stored as plain JSON. Reads mirror what the old decrypt
// // helper did: parsed JSON when possible, the raw string when not, null when
// // the cookie is absent.
// const parseCookieValue = (raw) => {
//   if (raw === undefined || raw === null) return null;
//   try {
//     return JSON.parse(raw);
//   } catch {
//     return raw;
//   }
// };

// // -----------set selective values to cookie
// export const storeValuesToCookie = (cookieName, values, options) =>
//   Cookies.set(cookieName, JSON.stringify(values), {
//     ...COOKIE_OPTIONS,
//     ...options,
//   });

// export const getValuesFromCookie = (cookieName) =>
//   parseCookieValue(Cookies.get(cookieName));

// export const removeValuesFromCookie = (cookieName) =>
//   Cookies.remove(cookieName, { path: COOKIE_OPTIONS.path });

// // -------------------------
// let handlers = {
//   onAuthError: () => {
//     if (typeof window !== "undefined") window.location.href = "/";
//   },
//   onError: (message) => {
//     if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
//       console.error("[API]", message);
//     }
//   },
// };

// export const setApiHandlers = (next = {}) => {
//   handlers = { ...handlers, ...next };
// };

// const isAuthFailure = (status) => [401, 403, 419].includes(Number(status));

// const joinUrl = (path) =>
//   /^https?:\/\//.test(path)
//     ? path
//     : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// async function request(
//   method,
//   path,
//   {
//     data,
//     params,
//     headers = {},
//     multipart = false,
//     signal,
//     cache = "no-store",
//   } = {},
// ) {
//   const token = getToken();
//   const m = method.toUpperCase();

//   const [base, existingQs = ""] = path.split("?");
//   let url = joinUrl(base);
//   let body;

//   const reqHeaders = { Accept: "application/json", ...headers };
//   // The token travels ONLY on the Authorization header — never in the query
//   // string or body, where it would end up in server/proxy logs.
//   if (token) reqHeaders.Authorization = `Bearer ${token}`;

//   if (m === "GET" || m === "DELETE") {
//     const qs = buildQuery({
//       ...queryStringToJSON(existingQs),
//       ...(params || {}),
//     });
//     if (qs) url += `?${qs}`;
//   } else {
//     if (existingQs) url += `?${existingQs}`;

//     if (multipart || data instanceof FormData) {
//       // Content-Type is deliberately left unset so the browser adds the
//       // multipart boundary itself.
//       if (data instanceof FormData) {
//         body = data;
//       } else {
//         const fd = new FormData();
//         Object.entries(data || {}).forEach(([k, v]) => {
//           if (v !== undefined && v !== null) fd.append(k, v);
//         });
//         body = fd;
//       }
//     } else {
//       reqHeaders["Content-Type"] = "application/json";
//       body = JSON.stringify(data || {});
//     }
//   }

//   let res;
//   try {
//     res = await fetch(url, {
//       method: m,
//       headers: reqHeaders,
//       body,
//       signal,
//       cache,
//     });
//   } catch (err) {
//     handlers.onError(
//       err?.message || "Network error. Please check your connection.",
//     );
//     throw err;
//   }

//   let final = null;
//   try {
//     final = await res.json();
//   } catch {
//     // no/empty body
//   }

//   const apiStatus = final?.status ?? res.status;

//   if (isAuthFailure(apiStatus)) {
//     removeToken();
//     handlers.onAuthError(apiStatus);
//   }

//   if (!res.ok || Number(apiStatus) >= 400) {
//     const message =
//       final?.message || final?.data?.message || `Request failed (${apiStatus})`;
//     handlers.onError(message);
//     const error = new Error(message);
//     error.status = apiStatus;
//     error.response = final;
//     throw error;
//   }

//   return final;
// }

// export const api = {
//   get: (path, opts) => request("GET", path, opts),
//   delete: (path, opts) => request("DELETE", path, opts),
//   post: (path, data, opts) => request("POST", path, { ...opts, data }),
//   put: (path, data, opts) => request("PUT", path, { ...opts, data }),
//   patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
// };

// export default api;

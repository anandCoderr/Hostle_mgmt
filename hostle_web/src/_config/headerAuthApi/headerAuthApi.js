// USE WHEN: client-side, logged-in user, but a 401 must NOT log the user out (only 403/419 do).

import Cookies from "js-cookie";
import { buildQuery, queryStringToJSON } from "../queryString";
// import { logger } from "@/utils/logger";
import { TOKEN_KEYS, removeToken } from "../apiInstance";

// =============================================================================
// headerAuthApi — variant of apiInstance.js for endpoints whose backend DTOs
// use class-validator with `forbidNonWhitelisted: true` and read the JWT
// ONLY from the `Authorization` header.
//
// Now that the encrypted envelope is gone, this behaves the same as
// apiInstance.js: plain JSON in, plain JSON out, token on the Authorization
// header only. It is kept as a separate export so existing call sites keep
// working — the one remaining difference is that it does NOT treat 401 as an
// auth failure (see isAuthFailure below).
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onAuthError: () => {
    if (typeof window !== "undefined") window.location.href = "/";
  },
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[HEADER AUTH API]", message);
    }
  },
};

export const setHeaderAuthApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

// ------401 :  removed
const isAuthFailure = (status) => [403, 419].includes(Number(status));

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const getToken = () => Cookies.get(TOKEN_KEYS.token) || null;

async function request(
  method,
  path,
  {
    data,
    params,
    headers = {},
    multipart = false,
    signal,
    cache = "no-store",
  } = {},
) {
  const token = getToken();
  const m = method.toUpperCase();

  const [base, existingQs = ""] = path.split("?");
  let url = joinUrl(base);
  let body;

  const reqHeaders = { Accept: "application/json", ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

  // GET and param-only DELETE send plain query params. A DELETE that passes
  // `data` (e.g. DELETE /user/profile with { reason }) falls through to the
  // body branch below.
  if (m === "GET" || (m === "DELETE" && !data)) {
    const qs = buildQuery({
      ...queryStringToJSON(existingQs),
      ...(params || {}),
    });
    if (qs) url += `?${qs}`;
  } else {
    if (existingQs) url += `?${existingQs}`;

    if (multipart || data instanceof FormData) {
      if (data instanceof FormData) {
        body = data;
      } else {
        const fd = new FormData();
        Object.entries(data || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        body = fd;
      }
    } else {
      reqHeaders["Content-Type"] = "application/json";
      body = JSON.stringify(data || {});
      // logger.log("[HEADER AUTH API] body:------->", body);
    }
  }

  let res;
  try {
    res = await fetch(url, {
      method: m,
      headers: reqHeaders,
      body,
      signal,
      cache,
    });
  } catch (err) {
    handlers.onError(
      err?.message || "Network error. Please check your connection.",
    );
    throw err;
  }

  let final = null;
  try {
    final = await res.json();
  } catch {
    // no/empty body
  }

  // logger.log("final response:------->", final);
  const apiStatus = final?.status ?? res.status;

  // return;

  if (isAuthFailure(apiStatus)) {
    removeToken();
    handlers.onAuthError(apiStatus);
  }

  if (!res.ok || Number(apiStatus) >= 400) {
    const message =
      final?.message || final?.data?.message || `Request failed (${apiStatus})`;
    handlers.onError(message);
    const error = new Error(message);
    error.status = apiStatus;
    error.response = final;
    throw error;
  }

  return final;
}

export const headerAuthApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default headerAuthApi;

// USE WHEN: server-side (RSC / Server Action / Route Handler), no login — no JWT; accepts JSON or plain-text responses.

import "server-only";
// import { logger } from "@/utils/logger";

// SERVER-SIDE mirror of /src/_config/publicApiInstance.js
//
// Use this for endpoints that need NO auth token (CMS content, static
// lookups, etc.) when calling from a Server Component, Server Action, or
// Route Handler.
//
// Behavior matches publicApiInstance.js: plain params in, plain JSON out.
// Throws on error so calling code can try/catch (same shape as client).

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[SERVER PUBLIC API]", message);
    }
  },
};

export const setServerPublicApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

async function request(
  method,
  path,
  { data, params, headers = {}, signal, cache = "no-store" } = {},
) {
  const m = method.toUpperCase();
  let url = joinUrl(path);
  let body;

  const reqHeaders = { Accept: "application/json", ...headers };

  if (m === "GET" || m === "DELETE") {
    if (params && Object.keys(params).length) {
      const qs = new URLSearchParams(params).toString();
      url += (url.includes("?") ? "&" : "?") + qs;
    }
  } else if (data instanceof FormData) {
    body = data;
  } else if (data !== undefined && data !== null) {
    reqHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(data);
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

  let payload = null;
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) payload = await res.json();
    else payload = await res.text();
  } catch {
    // no/empty body
  }

  // logger.log("server public api response:--->", payload);
  const apiStatus = payload?.status ?? res.status;

  if (!res.ok || Number(apiStatus) >= 400) {
    const message =
      payload?.message ||
      payload?.data?.message ||
      `Request failed (${apiStatus})`;
    handlers.onError(message);
    const error = new Error(message);
    error.status = apiStatus;
    error.response = payload;
    throw error;
  }

  return payload;
}

export const serverPublicApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default serverPublicApi;

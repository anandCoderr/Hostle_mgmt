// USE WHEN: client-side, no login needed — no JWT sent; JSON only, and empty/null query params are dropped.

// import { logger } from "@/utils/logger";
import { buildQuery } from "./queryString";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[PUBLIC RAW API]", message);
    }
  },
};

export const setPublicRawApiHandlers = (next = {}) => {
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
    const qs = buildQuery(params);
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
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

  let final = null;
  try {
    final = await res.json();
  } catch {
    // no/empty body
  }

  // logger.log("public raw api response:--->", final);
  const apiStatus = final?.status ?? res.status;

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

export const publicRawApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default publicRawApi;

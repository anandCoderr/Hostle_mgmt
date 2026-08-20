import "server-only";
import { decryptData } from "@/_config/encryption";
// import { logger } from "@/utils/logger";

// SERVER-SIDE public raw API helper.
//
// Use this for endpoints that expect PLAIN query params / JSON body, should
// receive NO auth token, but still return the encrypted `payload` envelope in
// the response.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[SERVER PUBLIC RAW API]", message);
    }
  },
};

export const setServerPublicRawApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const decryptResponse = (json) => {
  if (!json) return json;
  if (typeof json?.payload !== "string") return json;
  const decrypted = decryptData(json.payload);
  return decrypted?.response ?? decrypted ?? json;
};

const buildQuery = (params) => {
  if (!params || !Object.keys(params).length) return "";
  const cleaned = Object.entries(params).filter(
    ([, v]) => v !== "" && v !== undefined && v !== null,
  );
  if (!cleaned.length) return "";
  return new URLSearchParams(Object.fromEntries(cleaned)).toString();
};

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

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no/empty body
  }

  const final = decryptResponse(payload);
  // logger.log("server public raw api decrypted response:--->", final);
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

export const serverPublicRawApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default serverPublicRawApi;

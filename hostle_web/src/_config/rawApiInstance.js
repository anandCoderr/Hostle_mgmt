// import { logger } from "@/utils/logger";
import { getToken, removeToken } from "./apiInstance";
import { decryptData } from "./encryption";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onAuthError: () => {
    if (typeof window !== "undefined") window.location.href = "/";
  },
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[RAW API]", message);
    }
  },
};

export const setRawApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

const isAuthFailure = (status) => [401, 403, 419].includes(Number(status));

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// Server still returns responses wrapped in an encrypted `payload` field even
// when the request body is plain — unwrap it here so callers always see JSON.
const decryptResponse = (json) => {
  if (!json) return json;
  if (typeof json?.payload !== "string") return json;
  const decrypted = decryptData(json.payload);
  return decrypted?.response ?? decrypted ?? json;
};

async function request(
  method,
  path,
  { data, params, headers = {}, signal, cache = "no-store" } = {},
) {
  const token = getToken();
  const m = method.toUpperCase();

  let url = joinUrl(path);
  let body;

  const reqHeaders = { Accept: "application/json", ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

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
  try {
    payload = await res.json();
  } catch {
    // no/empty body
  }

  const final = decryptResponse(payload);
  // logger.log("raw api decrypted response:--->", final);
  const apiStatus = final?.status ?? res.status;

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

export const rawApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default rawApi;

import Cookies from "js-cookie";
import { decryptData, encryptData, queryStringToJSON } from "../encryption";
// import { logger } from "@/utils/logger";
import { apiVariables } from "../cookie/configConst";
import { TOKEN_KEYS, removeToken } from "../apiInstance";

// =============================================================================
// headerAuthApi — variant of apiInstance.js for endpoints whose backend DTOs
// use class-validator with `forbidNonWhitelisted: true` and read the JWT
// ONLY from the `Authorization` header.
//
// Same as apiInstance.js:
//   - Request body / GET query are wrapped in the encrypted `payload` envelope
//   - Response `payload` field is decrypted before returning to the caller
//   - 401/403/419 trigger removeToken() + onAuthError() (mirrors apiInstance)
//
// Different from apiInstance.js:
//   - The token is NOT injected into the encrypted payload. It only goes on
//     the Authorization header. This avoids the
//     "property token should not exist" 400 from strict DTOs.
//
// Wire endpoints to this client when you see that error from the backend,
// e.g. /user/support, /user/profile/change-password.
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiName = apiVariables.apiName;

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

const decryptResponse = (json) => {
  if (!json) return json;
  if (typeof json?.payload !== "string") return json;
  const decrypted = decryptData(json.payload);
  return decrypted?.response ?? decrypted ?? json;
};

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

  // GET and param-only DELETE put the encrypted envelope on the query string.
  // A DELETE that passes `data` (e.g. DELETE /user/profile with { reason })
  // falls through to the body branch below and sends the envelope in the body.
  if (m === "GET" || (m === "DELETE" && !data)) {
    const merged = {
      ...queryStringToJSON(existingQs),
      ...(params || {}),
    };
    const encrypted = encryptData(merged);
    url += `?${new URLSearchParams({ [apiName]: encrypted }).toString()}`;
  } else {
    if (existingQs) url += `?${existingQs}`;

    if (multipart || data instanceof FormData) {
      const fd = new FormData();
      const textObj = {};
      if (data instanceof FormData) {
        for (const [k, v] of data.entries()) {
          if (v instanceof File || v instanceof Blob) fd.append(k, v);
          else textObj[k] = v;
        }
      } else if (data && typeof data === "object") {
        Object.assign(textObj, data);
      }
      fd.append(apiName, encryptData(textObj));
      body = fd;
    } else {
      reqHeaders["Content-Type"] = "application/json";
      body = JSON.stringify({
        [apiName]: encryptData(data || {}),
      });
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

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no/empty body
  }

  const final = decryptResponse(payload);

  // logger.log("final decryptResponse:------->", final);
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

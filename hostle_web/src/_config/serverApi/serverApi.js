// USE WHEN: server-side (RSC / Server Action / Route Handler), logged in — JWT read from the request cookie.

import "server-only";
import { buildQuery, queryStringToJSON } from "@/_config/queryString";
import { getNonEncryptedCookies } from "../cookie/cookieOperations";
import { logger } from "@/utils/logger";

// SERVER-SIDE mirror of /src/_config/apiInstance.js
//
// Plain query params / JSON body in, plain JSON out. Use from Server
// Components, Server Actions and Route Handlers.
//
// Token source: the request cookie via next/headers (js-cookie cannot read
// cookies on the server). It is sent ONLY on the Authorization header.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[SERVER API]", message);
    }
  },
};

export const setServerApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

const isAuthFailure = (status) => [401, 403, 419].includes(Number(status));

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

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
  // The auth cookie is stored JSON-stringified (i.e. the cookie value is
  // `"<jwt>"` with wrapping quotes). Parse it to get the clean JWT — otherwise
  // the header becomes `Bearer "<jwt>"` and the backend rejects it as
  // "invalid format".
  const rawToken = await getNonEncryptedCookies();
  let token = null;
  if (rawToken) {
    try {
      token = JSON.parse(rawToken);
    } catch {
      token = rawToken;
    }
  }

  logger.log("token:------->", token);

  const m = method.toUpperCase();

  const [base, existingQs = ""] = path.split("?");
  let url = joinUrl(base);
  let body;

  const reqHeaders = { Accept: "application/json", ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

  if (m === "GET" || m === "DELETE") {
    const qs = buildQuery({
      ...queryStringToJSON(existingQs),
      ...(params || {}),
    });
    if (qs) url += `?${qs}`;
  } else {
    if (existingQs) url += `?${existingQs}`;

    if (multipart || data instanceof FormData) {
      // Content-Type is deliberately left unset so fetch adds the multipart
      // boundary itself.
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

      logger.log("body:---->", body);
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

  logger.log("server api response:--->", final);
  const apiStatus = final?.status ?? res.status;

  if (isAuthFailure(apiStatus)) {
    handlers.onError(final?.message || "Authentication required");
    const error = new Error(final?.message || "Authentication required");
    error.status = apiStatus;
    error.response = final;
    error.isAuthFailure = true;
    throw error;
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

export const serverApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default serverApi;

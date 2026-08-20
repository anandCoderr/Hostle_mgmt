// USE WHEN: server-side (RSC / Server Action / Route Handler), logged in — like serverApi, params/FormData sent as given.

import "server-only";
import { buildQuery } from "@/_config/queryString";
import { getCookies } from "../cookie/cookieOperations";
// import { logger } from "@/utils/logger";

// SERVER-SIDE mirror of /src/_config/rawApiInstance.js
//
// Use this for authenticated calls from a Server Component / Server Action:
// plain query params or JSON body in, plain JSON out.
//
// Token source:
//   js-cookie can't read cookies on the server. We read the request's
//   cookie via next/headers cookies() — the browser already attached it to
//   the incoming request. Same JWT, different door.
//
// Auth-failure side effects (removeToken, window.location):
//   Skipped on the server. A Server Component can read cookies but not
//   write/clear them — only Route Handlers and Server Actions can. The
//   middleware (proxy.js) already redirects unauthenticated requests, and
//   the client-side rawApi handles its own cleanup. We just throw on 401
//   here and let the caller decide.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let handlers = {
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[SERVER RAW API]", message);
    }
  },
};

export const setServerRawApiHandlers = (next = {}) => {
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
  { data, params, headers = {}, signal, cache = "no-store" } = {},
) {
  // const token = (await cookies()).get(TOKEN_KEYS.token)?.value;
  const token = await getCookies();
  const m = method.toUpperCase();
  let url = joinUrl(path);
  let body;

  const reqHeaders = { Accept: "application/json", ...headers };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;

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

  // logger.log("server raw api response:--->", final);
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

export const serverRawApi = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default serverRawApi;

import Cookies from "js-cookie";
import { decryptData, encryptData, queryStringToJSON } from "./encryption";
// import { logger } from "@/utils/logger";
import { apiVariables, authCookie } from "./cookie/configConst";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiName = apiVariables.apiName;

export const TOKEN_KEYS = {
  token: "saha_soul_web_user_token",
  detail: "saha_soul_web_user_details",
  permission: "garden_go_admin-permission",
  // -------need to find who
  signUpCred: "signup-cred",
  loginWithPhoe: "loginPhonePayload",
};

export const AUTH_CHANGED_EVENT = "saha-soul-auth-changed";

export const notifyAuthChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
};

const COOKIE_OPTIONS = {
  expires: 7,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const getToken = () => Cookies.get(authCookie.token) || null;

export const setToken = (token, options) =>
  Cookies.set(TOKEN_KEYS.token, token, { ...COOKIE_OPTIONS, ...options });

export const removeToken = () => {
  Object.values(TOKEN_KEYS).forEach((k) =>
    Cookies.remove(k, { path: COOKIE_OPTIONS.path }),
  );
};

// -----------set selective values to cookie
export const storeValuesToCookie = (cookieName, values, options) =>
  Cookies.set(cookieName, encryptData(values), {
    ...COOKIE_OPTIONS,
    ...options,
  });

export const getValuesFromCookie = (cookieName) =>
  Cookies.get(cookieName) ? decryptData(Cookies.get(cookieName)) : null;

export const removeValuesFromCookie = (cookieName) =>
  Cookies.remove(cookieName, { path: COOKIE_OPTIONS.path });

// -------------------------
let handlers = {
  onAuthError: () => {
    if (typeof window !== "undefined") window.location.href = "/";
  },
  onError: (message) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
      console.error("[API]", message);
    }
  },
};

export const setApiHandlers = (next = {}) => {
  handlers = { ...handlers, ...next };
};

const isAuthFailure = (status) => [401, 403, 419].includes(Number(status));

const joinUrl = (path) =>
  /^https?:\/\//.test(path)
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const decryptResponse = (json) => {
  // if (!json) return json;
  // if (typeof json.data !== "string") return json;
  // const decrypted = decryptData(json.data);
  // return decrypted?.response ?? decrypted ?? json;

  if (!json) return json;
  if (typeof json?.payload !== "string") return json;
  const decrypted = decryptData(json.payload);
  return decrypted?.response ?? decrypted ?? json;
};

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

  if (m === "GET" || m === "DELETE") {
    const merged = {
      ...queryStringToJSON(existingQs),
      ...(params || {}),
      ...(token ? { token } : {}),
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
      const effectiveToken = token || textObj.token;
      fd.append(
        apiName,
        encryptData({
          ...textObj,
          ...(effectiveToken ? { token: effectiveToken } : {}),
        }),
      );
      body = fd;

      // logger.log("body:-------->", Object.fromEntries(fd.entries()));
    } else {
      reqHeaders["Content-Type"] = "application/json";

      // logger.log("data to send:----->", data);
      const effectiveToken = token || data?.token;
      body = JSON.stringify({
        [apiName]: encryptData({
          ...(data || {}),
          ...(effectiveToken ? { token: effectiveToken } : {}),
        }),
      });

      // logger.log("body:------->", body);
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

  // logger.log("payload for decryptResponse:----->", payload);
  const final = decryptResponse(payload);
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

export const api = {
  get: (path, opts) => request("GET", path, opts),
  delete: (path, opts) => request("DELETE", path, opts),
  post: (path, data, opts) => request("POST", path, { ...opts, data }),
  put: (path, data, opts) => request("PUT", path, { ...opts, data }),
  patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
};

export default api;

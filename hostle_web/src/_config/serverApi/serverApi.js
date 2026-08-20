// -------------------------New code: token goes into header

import "server-only";
import { cookies } from "next/headers";
import {
  decryptData,
  encryptData,
  queryStringToJSON,
} from "@/_config/encryption";
import { apiVariables } from "../cookie/configConst";
import { getNonEncryptedCookies } from "../cookie/cookieOperations";
import { logger } from "@/utils/logger";
// import { logger } from "@/utils/logger";

// SERVER-SIDE mirror of /src/_config/apiInstance.js
//
// Use this for endpoints that expect the encrypted `?payload=...` /
// `{ payload: "..." }` ENVELOPE both ways — request and response (auth
// flows, user profile, etc.). DO NOT use for endpoints that validate
// params plainly (use serverRawApi for those — see serverRawApi.js).
//
// Token source: next/headers cookies() — same reasoning as serverRawApi.

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiName = apiVariables.apiName;

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

const decryptResponse = (json) => {
  if (!json) return json;
  if (typeof json?.data !== "string") return json;
  const decrypted = decryptData(json.data);
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
  // const token = (await cookies()).get(TOKEN_KEYS.token)?.value;

  // `noorlam_seller_auth_token` is stored NON-encrypted but JSON-stringified
  // (i.e. the cookie value is `"<jwt>"` with wrapping quotes). Parse it to get
  // the clean JWT — otherwise the header becomes `Bearer "<jwt>"` and the
  // backend rejects it as "invalid format".
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
      // Token goes in the Authorization header ONLY (set above) — NOT in the
      // encrypted body.

      fd.append(apiName, encryptData({ ...textObj }));
      body = fd;
    } else {
      reqHeaders["Content-Type"] = "application/json";
      // Token goes in the Authorization header ONLY (set above) — NOT in the
      // encrypted body.

      body = JSON.stringify({
        [apiName]: encryptData({ ...(data || {}) }),
      });

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

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // no/empty body
  }

  const final = decryptResponse(payload);
  logger.log("server api decrypted response:--->", final);
  const apiStatus = final?.status ?? res.status;
  // logger.log("apiStatus")

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

// -------------------old code:  token is going into encrpted body

// import "server-only";
// import { cookies } from "next/headers";
// import {
//   decryptData,
//   encryptData,
//   queryStringToJSON,
// } from "@/_config/encryption";
// import { apiVariables } from "../cookie/configConst";
// import { getCookies } from "../cookie/cookieOperations";
// import { logger } from "@/utils/logger";
// // import { logger } from "@/utils/logger";

// // SERVER-SIDE mirror of /src/_config/apiInstance.js
// //
// // Use this for endpoints that expect the encrypted `?payload=...` /
// // `{ payload: "..." }` ENVELOPE both ways — request and response (auth
// // flows, user profile, etc.). DO NOT use for endpoints that validate
// // params plainly (use serverRawApi for those — see serverRawApi.js).
// //
// // Token source: next/headers cookies() — same reasoning as serverRawApi.

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const apiName = apiVariables.apiName;

// let handlers = {
//   onError: (message) => {
//     if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "true") {
//       console.error("[SERVER API]", message);
//     }
//   },
// };

// export const setServerApiHandlers = (next = {}) => {
//   handlers = { ...handlers, ...next };
// };

// const isAuthFailure = (status) => [401, 403, 419].includes(Number(status));

// const joinUrl = (path) =>
//   /^https?:\/\//.test(path)
//     ? path
//     : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// const decryptResponse = (json) => {
//   if (!json) return json;
//   if (typeof json?.data !== "string") return json;
//   const decrypted = decryptData(json.data);
//   return decrypted?.response ?? decrypted ?? json;
// };

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
//   // const token = (await cookies()).get(TOKEN_KEYS.token)?.value;

//   const token = await getCookies();

//   const m = method.toUpperCase();

//   const [base, existingQs = ""] = path.split("?");
//   let url = joinUrl(base);
//   let body;

//   const reqHeaders = { Accept: "application/json", ...headers };
//   if (token) reqHeaders.Authorization = `Bearer ${token}`;

//   if (m === "GET" || m === "DELETE") {
//     const merged = {
//       ...queryStringToJSON(existingQs),
//       ...(params || {}),
//       ...(token ? { token } : {}),
//     };
//     const encrypted = encryptData(merged);
//     url += `?${new URLSearchParams({ [apiName]: encrypted }).toString()}`;
//   } else {
//     if (existingQs) url += `?${existingQs}`;

//     if (multipart || data instanceof FormData) {
//       const fd = new FormData();
//       const textObj = {};
//       if (data instanceof FormData) {
//         for (const [k, v] of data.entries()) {
//           if (v instanceof File || v instanceof Blob) fd.append(k, v);
//           else textObj[k] = v;
//         }
//       } else if (data && typeof data === "object") {
//         Object.assign(textObj, data);
//       }
//       const effectiveToken = token || textObj.token;
//       fd.append(
//         apiName,
//         encryptData({
//           ...textObj,
//           ...(effectiveToken ? { token: effectiveToken } : {}),
//         }),
//       );
//       body = fd;
//     } else {
//       reqHeaders["Content-Type"] = "application/json";
//       const effectiveToken = token || data?.token;
//       body = JSON.stringify({
//         [apiName]: encryptData({
//           ...(data || {}),
//           ...(effectiveToken ? { token: effectiveToken } : {}),
//         }),
//       });

//       // logger.log("body:---->", body);
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

//   let payload = null;
//   try {
//     payload = await res.json();
//   } catch {
//     // no/empty body
//   }

//   const final = decryptResponse(payload);
//   logger.log("server api decrypted response:--->", final);
//   const apiStatus = final?.status ?? res.status;
//   // logger.log("apiStatus")

//   if (isAuthFailure(apiStatus)) {
//     handlers.onError(final?.message || "Authentication required");
//     const error = new Error(final?.message || "Authentication required");
//     error.status = apiStatus;
//     error.response = final;
//     error.isAuthFailure = true;
//     throw error;
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

// export const serverApi = {
//   get: (path, opts) => request("GET", path, opts),
//   delete: (path, opts) => request("DELETE", path, opts),
//   post: (path, data, opts) => request("POST", path, { ...opts, data }),
//   put: (path, data, opts) => request("PUT", path, { ...opts, data }),
//   patch: (path, data, opts) => request("PATCH", path, { ...opts, data }),
// };

// export default serverApi;

// Barrel for the header-auth (encrypted-envelope) API client.
//
// Use this client for endpoints that:
//   1. Still expect the encrypted `payload` envelope on the request body / query.
//   2. Read the JWT ONLY from the `Authorization` header (strict DTOs that
//      reject extra fields like `token`).
//
// If you hit "property token should not exist" from the backend on an
// endpoint, switch its caller from `api` to `headerAuthApi`.
//
// Import example:
//   import { headerAuthApi } from "@/_config/headerAuthApi";
//   await headerAuthApi.post("/user/profile/change-password", { oldPassword, newPassword });

export {
  default as headerAuthApi,
  setHeaderAuthApiHandlers,
} from "./headerAuthApi";

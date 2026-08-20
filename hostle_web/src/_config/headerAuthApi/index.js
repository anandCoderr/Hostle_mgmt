// USE WHEN: importing headerAuthApi — the client-side JWT client that ignores 401.

// Barrel for the header-auth API client.
//
// Plain JSON in, plain JSON out, JWT read ONLY from the `Authorization`
// header. Behaves like `api` from apiInstance.js except that it does not
// treat a 401 as an auth failure.
//
// Import example:
//   import { headerAuthApi } from "@/_config/headerAuthApi";
//   await headerAuthApi.post("/user/profile/change-password", { oldPassword, newPassword });

export {
  default as headerAuthApi,
  setHeaderAuthApiHandlers,
} from "./headerAuthApi";

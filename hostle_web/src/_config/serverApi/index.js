// USE WHEN: importing any server-side client — these fail the build if pulled into a client component.

// Barrel for the SERVER-side API instances.
// Use these from Server Components, Server Actions, and Route Handlers ONLY.
// Each underlying file declares `import "server-only"` — the build will fail
// loudly if any of these get pulled into a client bundle.
//
// Mapping to the client-side counterparts in /src/_config/:
//   serverApi           ↔  apiInstance.js        (authenticated)
//   serverRawApi        ↔  rawApiInstance.js     (authenticated)
//   serverPublicApi     ↔  publicApiInstance.js  (no auth)
//   serverPublicRawApi  ↔  publicRawApiInstance.js (no auth)
//
// All of them send and receive plain JSON.
//
// Import example:
//   import { serverRawApi } from "@/_config/serverApi";
//   const final = await serverRawApi.get("/user/consultants", { params });

export { default as serverApi, setServerApiHandlers } from "./serverApi";
export { default as serverRawApi, setServerRawApiHandlers } from "./serverRawApi";
export { default as serverPublicApi, setServerPublicApiHandlers } from "./serverPublicApi";
export {
  default as serverPublicRawApi,
  setServerPublicRawApiHandlers,
} from "./serverPublicRawApi";

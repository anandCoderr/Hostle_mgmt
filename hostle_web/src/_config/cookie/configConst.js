// USE WHEN: you need a cookie NAME or max-age — single source of truth for every cookie key.

export const authCookie = {
  token: "noorlam_seller_auth_token",
  userProfileToken: "userProfileTokenInfo",
};

// ---------cookie normal data

export const normalCookie = {
  signupStep1EmailOrPhone: "signupStep1EmailOrPhone",
};

// --------- seller register wizard: ONE cookie per step (2 → 7).
// Each step reads its own cookie to prefill (incl. on Back) and writes its
// slice on Continue/Back. The final submit reads them all.
export const registerStepCookie = {
  step2: "step2Cookie",
  step3: "step3Cookie",
  step4: "step4Cookie",
  step5: "step5Cookie",
  step6: "step6Cookie",
  step7: "step7Cookie",
};

// --------------------------it stores all cookies
export const allCookies = {
  ...authCookie,
  ...normalCookie,
  ...registerStepCookie,
};

// --------cookie duration
export const MINUTE = 60; // seconds

export const cookieMaxAge = {
  fiveMin: 5 * MINUTE,
  tenMin: 10 * MINUTE,
  fifteenMin: 15 * MINUTE,
  thirtyMin: 30 * MINUTE,
  sevenDays: 7 * 24 * 60 * MINUTE,
};

// --------------it decides how name would go in payload

export const apiVariables = {
  // apiName: "payload",
  apiName: "reqData",
};

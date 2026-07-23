import jwt from "jsonwebtoken";

const jwtConvert = (data = undefined, expIn = "1h") => {
  return jwt.sign(
    {
      data: data,
    },
    process.env.JWT_SECREATE_KEY,
    { expiresIn: expIn },
  );
};

// ----------------jwt verify
export const jwtVerify = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECREATE_KEY);
  } catch (error) {
    return {
      status: 401,
      message: "Token has expired or is invalid",
      data: {},
    };
  }
};

// ---------------imp note:

// jsonwebtoken's expiresIn option is powered by the ms package,
// so it accepts both numbers (seconds) and human-readable strings.

// | Duration   | Value to pass     |
// | ---------- | ----------------- |
// | 60 seconds | `"60s"` or `60`   |
// | 5 minutes  | `"5m"`            |
// | 10 minutes | `"10m"`           |
// | 15 minutes | `"15m"`           |
// | 30 minutes | `"30m"`           |
// | 45 minutes | `"45m"`           |
// | 1 hour     | `"1h"`            |
// | 2 hours    | `"2h"`            |
// | 3 hours    | `"3h"`            |
// | 5 hours    | `"5h"`            |
// | 12 hours   | `"12h"`           |
// | 24 hours   | `"24h"` or `"1d"` |
// | 2 days     | `"2d"`            |
// | 7 days     | `"7d"`            |
// | 15 days    | `"15d"`           |
// | 30 days    | `"30d"`           |
// | 90 days    | `"90d"`           |
// | 1 year     | `"365d"`          |

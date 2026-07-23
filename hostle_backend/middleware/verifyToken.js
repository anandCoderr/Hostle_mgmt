import { jwtVerify } from "../common/helper/jwtHelper.js";

/**
 * ─────────────────────────────────────────────────────────────
 *  verifyToken  –  JWT authentication middleware
 * ─────────────────────────────────────────────────────────────
 *
 *  Reads the Bearer token from the Authorization header,
 *  verifies it using jwtVerify(), and attaches the decoded
 *  payload to `req.user` so any downstream controller can
 *  access it directly.
 *
 *  ── Usage ────────────────────────────────────────────────────
 *
 *  import verifyToken from "../middleware/verifyToken.js";
 *
 *  // Protect a single route
 *  router.get("/profile", verifyToken, profileController);
 *
 *  // Protect all routes in a router
 *  router.use(verifyToken);
 *  router.get("/dashboard", dashboardController);
 *
 *  // Chain with validateRequest
 *  router.post(
 *    "/booking",
 *    verifyToken,
 *    validateRequest({ body: bookingSchema }),
 *    bookingController
 *  );
 *
 *  // Access decoded data inside any controller:
 *  const myController = (req, res) => {
 *    const { id, role, email } = req.user; // ← available here
 *  };
 *
 * ─────────────────────────────────────────────────────────────
 */

const verifyToken = (req, res, next) => {
  // ── 1. Extract the Authorization header ─────────────────────
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 401,
      message: "Access denied. No token provided.",
    });
  }

  // ── 2. Pull out the raw token ────────────────────────────────
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Access denied. Token is missing.",
    });
  }

  // ── 3. Verify using the existing jwtVerify helper ────────────
  const decoded = jwtVerify(token);

  // jwtVerify returns { status: 401, message: "..." } on failure
  if (decoded?.status === 401) {
    return res.status(401).json({
      status: 401,
      message: decoded.message,
    });
  }

  // ── 4. Attach decoded payload to req.user ────────────────────
  // jwtConvert wraps payload inside { data: payload }
  // so decoded.data holds the original object you passed
  req.user = decoded.data;

  next();
};

export default verifyToken;

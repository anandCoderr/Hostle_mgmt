import { z } from "zod";

/**
 * ─────────────────────────────────────────────────────────────
 *  validateRequest  –  Zod-powered request validation middleware
 * ─────────────────────────────────────────────────────────────
 *
 *  Pass a config object that can include any combination of:
 *    • body    → validates req.body
 *    • params  → validates req.params
 *    • query   → validates req.query
 *    • headers → validates req.headers  (only the keys you define)
 *
 *  Each value must be a Zod schema (z.object({ ... })).
 *
 *  ── Usage ────────────────────────────────────────────────────
 *
 *  import { z } from "zod";
 *  import validateRequest from "../middleware/validateRequest.js";
 *
 *  // 1. Body only
 *  router.post(
 *    "/register",
 *    validateRequest({
 *      body: z.object({
 *        name  : z.string().min(2),
 *        email : z.email(),
 *        password: z.string().min(6),
 *      }),
 *    }),
 *    registerController
 *  );
 *
 *  // 2. Params + Query
 *  router.get(
 *    "/user/:id",
 *    validateRequest({
 *      params: z.object({ id: z.string().uuid() }),
 *      query : z.object({ page: z.coerce.number().min(1).optional() }),
 *    }),
 *    getUserController
 *  );
 *
 *  // 3. Body + Headers
 *  router.post(
 *    "/webhook",
 *    validateRequest({
 *      body   : z.object({ event: z.string() }),
 *      headers: z.object({ "x-api-key": z.string().min(1) }),
 *    }),
 *    webhookController
 *  );
 *
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @param {{ body?: z.ZodSchema, params?: z.ZodSchema, query?: z.ZodSchema, headers?: z.ZodSchema }} schemas
 * @returns {import("express").RequestHandler}
 */
const validateRequest = (schemas = {}) => {
  return (req, res, next) => {
    const errors = {};

    // ── Sources to validate ──────────────────────────────────
    const sources = {
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
    };

    // ── Run each provided schema ─────────────────────────────
    for (const [source, schema] of Object.entries(schemas)) {
      if (!schema) continue;

      const result = schema.safeParse(sources[source]);

      if (!result.success) {
        // Flatten Zod issues into a clean key → message map
        errors[source] = result.error.issues.map((issue) => issue.message);
      } else {
        // ── Write parsed/coerced value back to the request ───
        // This ensures coercions (e.g. z.coerce.number()) take effect
        req[source] = result.data;
      }
    }

    // ── If any errors, respond immediately ───────────────────
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        status: 422,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

export default validateRequest;

import { Router } from "express";

import inviteRouter from "./invite.user.route.js";
import adminAuthRouter from "./auth.route.js";
import menuRouter from "./hostleRoute/menu.route.js";

const adminRoutes = Router();

adminRoutes.use("/invite", inviteRouter);
// -----------auth
adminRoutes.use("/auth", adminAuthRouter);

// --------menu
adminRoutes.use("/menu", menuRouter);

export default adminRoutes;

import { Router } from "express";

import inviteRouter from "./invite.user.route";

const adminRoutes = Router();

adminRoutes.use("/invite", inviteRouter);

export default adminRoutes;

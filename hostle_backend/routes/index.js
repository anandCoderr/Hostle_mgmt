import { Router } from "express";
import userRouter from "./user/index.js";
import adminRoutes from "./admin/index.js";

const router = Router();

router.use("/user/v1", userRouter);
router.use("/admin/v1", adminRoutes);

export default router;

import { Router } from "express";
import userRouter from "./user";
import adminRoutes from "./admin";

const router = Router();

router.use("/user/v1", userRouter);
router.use("/admin/v1", adminRoutes);

export default router;

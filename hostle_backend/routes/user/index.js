import { Router } from "express";
import userAuthRouter from "./auth.route.js";
import globaMenuRoute from "./likeDislike.route.js";

const userRouter = Router();
userRouter.use("/auth", userAuthRouter);

userRouter.use("/menu", globaMenuRoute);

export default userRouter;

import { Router } from "express";
import userAuthRouter from "./auth.route.js";
import userLikeRouter from "./likeDislike.route.js";

const userRouter = Router();
userRouter.use("/auth", userAuthRouter);

userRouter.use("/menu", userLikeRouter);

export default userRouter;

import { Router } from "express";
import { likeController } from "../../controller/menuController/likeCommentC.js";
import verifyToken from "../../middleware/verifyToken.js";
import validateRequest from "../../middleware/validateRequest.js";
import { menuValidate } from "../../common/validationSchema/menuSchema/index.js";

const userLikeRouter = Router();

userLikeRouter.use(verifyToken);

userLikeRouter.post(
  "/like",
  validateRequest({ body: menuValidate("likeDislikeMenuRule") }),
  likeController,
);

export default userLikeRouter;

import { Router } from "express";
import {
  commentController,
  likeController,
} from "../../controller/menuController/likeCommentC.js";
import verifyToken from "../../middleware/verifyToken.js";
import validateRequest from "../../middleware/validateRequest.js";
import { menuValidate } from "../../common/validationSchema/menuSchema/index.js";

const globaMenuRoute = Router();

globaMenuRoute.use(verifyToken);

globaMenuRoute.post(
  "/like",
  validateRequest({ body: menuValidate("likeDislikeMenuRule") }),
  likeController,
);

// -------------------comment

globaMenuRoute.post(
  "/add/comment",
  validateRequest({ body: menuValidate("commentMenuRule") }),
  commentController,
);

export default globaMenuRoute;

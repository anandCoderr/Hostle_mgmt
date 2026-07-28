import { Router } from "express";

import { addMenu } from "../../../controller/menuController/menuC.js";
import { menuValidate } from "../../../common/validationSchema/menuSchema/index.js";
import validateRequest from "../../../middleware/validateRequest.js";
import verifyToken from "../../../middleware/verifyToken.js";

const menuRouter = Router();

// menuRouter.use(verifyToken);

menuRouter.post(
  "/add",
  verifyToken,
  validateRequest({ body: menuValidate("addMenuRule") }),
  addMenu,
);

export default menuRouter;

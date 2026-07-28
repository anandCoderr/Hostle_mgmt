import { Router } from "express";

import { addMenu } from "../../../controller/menuController/menuC.js";
import { menuValidate } from "../../../common/validationSchema/menuSchema/index.js";

const menuRouter = Router();

menuRouter.post(
  "/add",
  validateRequest({ body: menuValidate("addMenuRule") }),
  addMenu,
);

export default menuRouter;

import { Router } from "express";

import {
  adminLoginApi,
  adminRegisterApi,
} from "../../controller/adminController/adminAuthController.js";
import { adminRegisterValidate } from "../../common/validationSchema/auth/authSchema.js";
import validateRequest from "../../middleware/validateRequest.js";

const adminAuthRouter = Router();

adminAuthRouter.post(
  "/register",
  validateRequest({ body: adminRegisterValidate("adminRegisterRule") }),
  adminRegisterApi,
);
adminAuthRouter.post(
  "/login",
  validateRequest({ body: adminRegisterValidate("adminLoginRule") }),
  adminLoginApi,
);

export default adminAuthRouter;

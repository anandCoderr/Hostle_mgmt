import { Router } from "express";
import { registerApi } from "../../controller/userController/userController.js";
import verifyToken from "../../middleware/verifyToken.js";
import validateRequest from "../../middleware/validateRequest.js";
import { userRegisterValidate } from "../../common/validationSchema/auth/authSchema.js";

const userAuthRouter = Router();

userAuthRouter.use(verifyToken);

userAuthRouter.post(
  "/register-via-invite",
  validateRequest({ body: userRegisterValidate("registerRule") }),
  registerApi,
);

export default userAuthRouter;

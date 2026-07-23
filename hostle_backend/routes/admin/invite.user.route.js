import { Router } from "express";
import sendInviteController from "../../controller/adminController/inviteController.js";

const inviteRouter = Router();

inviteRouter.use("/send-email-register", sendInviteController);

export default inviteRouter;

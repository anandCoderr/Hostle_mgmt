import { Router } from "express";
import sendInviteController from "../../controller/adminController/inviteController";

const inviteRouter = Router();

inviteRouter.use("/send-email-register", sendInviteController);

export default inviteRouter;

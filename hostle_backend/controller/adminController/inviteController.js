import { errorHelper } from "../../common/helper/globalHelper";
import { statusVar } from "../../common/static/statusCodeVar";
import { userMessage } from "../../common/static/userStatic";
import Inviteuser from "../../modal/adminModal/inviteModal";

export const sendInviteController = async (req, res) => {
  try {
    const { email } = req.body;

    const invitedUserRes = await Inviteuser.findOne({ email });

    if (invitedUserRes && invitedUserRes?.isUsed) {
      return errorHelper(res, {
        status: statusVar.alreadyAvailable,
        message: userMessage?.ALREADY_AVAILABLE,
      });
    }
  } catch (error) {}
};

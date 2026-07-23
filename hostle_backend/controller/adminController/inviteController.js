import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { nodeMailerOtpHelper } from "../../common/helper/nodeMailer.js";
import { jwtConvert } from "../../common/helper/jwtHelper.js"; // Assuming this is the correct path
import { errorStaticVar } from "../../common/static/errorStatis.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import { userMessage } from "../../common/static/userStatic.js";
import Inviteuser from "../../modal/adminModal/inviteModal.js";

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

    const token = jwtConvert({ email }, "24h");

    if (!token) {
      return errorHelper(res, {
        message: errorStaticVar?.JWT_CREATION_ERR,
      });
    }

    const mailerRes = await nodeMailerOtpHelper(
      email,
      messageStatic?.AUTH_LINK_TITLE,
      `<p>
        Please click this link to register for hostle: <br />
        <a href="http://localhost:3000/hostle-mgmt/register?token=${token}">Register Here</a>
      </p>`,
    );

    if (!mailerRes) {
      return errorHelper(res, {
        message: errorStaticVar?.NODE_MAILER_ERROR,
      });
    }

    const inviteUser = Inviteuser({
      email,
      token,
      // invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const inviteUserRes = await inviteUser.save();

    if (!inviteUserRes) {
      console.log("invited User's data can't be saved");
      return;
    }

    return successHelper(res, messageStatic.EMAIL_SENT_SUCCESS);
  } catch (error) {
    console.log(error);
  }
};

export default sendInviteController;

import { errorHelper } from "../../common/helper/globalHelper";
import { nodeMailerOtpHelper } from "../../common/helper/nodeMailer";
import { errorStaticVar } from "../../common/static/errorStatis";
import { messageStatic } from "../../common/static/messageStatic";
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

    const token = jwtConvert({ email }, "24h");

    if (!token) {
      return errorHelper(res, {
        message: errorStaticVar?.JWT_CREATION_ERR,
      });
    }

    const mailerRes = await nodeMailerOtpHelper(
      email,
      messageStatic?.AUTH_LINK_TITLE,

      <p>
        Please click this link to register hostle: <br />
        `http://localhost:3000/hostle-mgmt/register?token={token}`
      </p>,
    );

    if (!mailerRes) {
      return errorHelper(res, {
        message: errorStaticVar?.NODE_MAILER_ERROR,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export default sendInviteController;

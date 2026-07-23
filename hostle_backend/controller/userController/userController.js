import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import Inviteuser from "../../modal/adminModal/inviteModal.js";
import userSchema from "../../modal/userModal/userModal.js";

const registerApi = async (req, res) => {
  try {
    const { name, email, room, phone, password } = req.body;
    console.log("req.user:---------->", req.user);

    const inviteUserRes = await Inviteuser.findOne({ email: email });

    if (!inviteUserRes) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.USER_NOT_FOUND,
      });
    }

    if (inviteUserRes.isUsed) {
      return errorHelper(res, {
        status: statusVar.alreadyAvailable,
        message: messageStatic.USER_AVAILABLE_AND_IN_USE,
      });
    }

    const userSchemaRes = userSchema({
      name,
      email,
      room,
      phone,
      password,
    });

    const userRes = await userSchemaRes.save();

    if (!userRes) {
      console.log("User did not saved");
      return;
    }

    const inviteUserRes = await Inviteuser.updateOne(
      { email, _id: inviteUserRes._id },
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
        },
      },
    );

    if (!inviteUserRes) {
      console.log("In Inviteuser schema data not updated");
      return;
    }

    return successHelper(
      res,
      messageStatic.USER_ADDED_SUCCESS,
      statusVar.CREATED_SUCCESSFULLY,
      userRes,
    );
  } catch (error) {
    console.log("error:------->", error);
  }
};

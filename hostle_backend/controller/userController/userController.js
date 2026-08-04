import { bcryptCompare } from "../../common/helper/bcryptFun.js";
import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { jwtConvert } from "../../common/helper/jwtHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import Inviteuser from "../../modal/adminModal/inviteModal.js";
import userSchema from "../../modal/userModal/userModal.js";

export const registerApi = async (req, res) => {
  try {
    const { name, email, room, phone, password } = req.body;
    console.log("req.user:---------->", req.user);

    // ---------------ALREADY AVAILABLE

    const findUserRes = await userSchema.findOne({ email: email });

    if (findUserRes) {
      return errorHelper(res, {
        status: statusVar.alreadyAvailable,
        message: messageStatic.USER_AVAILABLE,
      });
    }

    // -------------invite user check

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

    const inviteUserResVar = await Inviteuser.updateOne(
      { email, _id: inviteUserRes._id },
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
        },
      },
    );

    if (!inviteUserResVar) {
      console.log("In Inviteuser schema data not updated");
      return;
    }

    // ----------jwt conversion

    const token = jwtConvert(userRes, "365d");

    return successHelper(
      res,
      messageStatic.USER_ADDED_SUCCESS,
      statusVar.CREATED_SUCCESSFULLY,
      { data: userRes, token: token },
    );
  } catch (error) {
    console.log("error:------->", error);
    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

// ----------------------adminLoginApi

export const userLoginApi = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRes = await userSchema.findOne({ email: email });
    console.log("userRes:----->", userRes);

    if (!userRes) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.USER_NOT_FOUND,
      });
    }

    const bcryptCompareRes = bcryptCompare(password, userRes.password);

    if (!bcryptCompareRes) {
      return errorHelper(res, {
        message: messageStatic.PASSWORD_NOT_MATCH,
      });
    }

    // ----------jwt conversion

    const token = jwtConvert(userRes, "365d");

    return successHelper(
      res,
      messageStatic.ADMIN_ADDED_SUCCESS,
      statusVar.CREATED_SUCCESSFULLY,
      { data: userRes, token: token },
    );
  } catch (error) {
    console.log("error:------->", error);
  }
};

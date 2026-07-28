import { bcryptCompare } from "../../common/helper/bcryptFun.js";
import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { jwtConvert } from "../../common/helper/jwtHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import AdminAuth from "../../modal/adminModal/adminAuth.js";

export const adminRegisterApi = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // ---------------ALREADY AVAILABLE

    const findAdminRes = await AdminAuth.findOne({ email: email });

    if (findAdminRes) {
      return errorHelper(res, {
        status: statusVar.alreadyAvailable,
        message: messageStatic.ADMIN_AVAILABLE,
      });
    }

    const adminSchemaRes = AdminAuth({
      name,
      email,
      mobile,
      password,
    });

    const adminRes = await adminSchemaRes.save();

    if (!adminRes) {
      console.log("User did not saved");
      return;
    }

    // ----------jwt conversion

    const token = jwtConvert(adminRes, "365d");

    return successHelper(
      res,
      messageStatic.ADMIN_ADDED_SUCCESS,
      statusVar.CREATED_SUCCESSFULLY,
      { data: adminRes, token: token },
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

export const adminLoginApi = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminRes = await AdminAuth.findOne({ email: email });

    if (!adminRes) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.ADMIN_NOT_FOUND,
      });
    }

    const bcryptCompareRes = await bcryptCompare(password, adminRes.password);

    if (!bcryptCompareRes) {
      return errorHelper(res, {
        message: messageStatic.PASSWORD_NOT_MATCH,
      });
    }

    // ----------jwt conversion

    const token = jwtConvert(adminRes, "365d");

    return successHelper(
      res,
      messageStatic.ADMIN_ADDED_SUCCESS,
      statusVar.CREATED_SUCCESSFULLY,
      { data: adminRes, token: token },
    );
  } catch (error) {
    console.log("error:------->", error);
  }
};

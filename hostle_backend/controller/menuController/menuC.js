import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import menuSchema from "../../modal/menu/hostleMenu.js";

export const addMenu = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;
    const { type, day, date, description, title, breakfast, lunch, dinner } =
      req.body;

    if (["WEEKLY"].includes(type)) {
      const menuRes = await menuSchema.findOneAndUpdate(
        { type, day },
        {
          $set: {
            type,
            day,
            description,
            title,
            breakfast,
            lunch,
            dinner,
            createdBy,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      if (!menuRes) {
        return errorHelper(res, {
          status: statusVar.SERVER_ERROR,
          message: messageStatic.SERVER_ERROR,
        });
      }

      return successHelper(
        res,
        messageStatic.MENU_ADDED,
        statusVar.CREATED_SUCCESSFULLY,
        {
          data: menuRes,
        },
      );
    } else {
      const menuRes = await menuSchema.findOneAndUpdate(
        { type, date },
        {
          $set: {
            type,
            date,
            description,
            title,
            breakfast,
            lunch,
            dinner,
            createdBy,
          },
        },
        {
          upsert: true,
          new: true,
        },
      );

      if (!menuRes) {
        return errorHelper(res, {
          status: statusVar.SERVER_ERROR,
          message: messageStatic.SERVER_ERROR,
        });
      }

      return successHelper(
        res,
        messageStatic.MENU_ADDED,
        statusVar.CREATED_SUCCESSFULLY,
        {
          data: menuRes,
        },
      );
    }
  } catch (error) {
    console.log("error:-------->", error);
    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import menuSchema from "../../modal/menu/hostleMenu.js";
import { getDay } from "../../utils/dateAndTime/index.js";

export const addMenu = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;
    console.log("req.body:----->", req.body);
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
          // new: true,
          returnDocument: "after",
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
          // new: true,
          returnDocument: "after",
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

// --------------get all menu type based

export const getAllMenu = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;

    const { type = "WEEKLY", isToday = false } = req.query;

    // -filter

    const filterPaylaod = {
      type,
      createdBy: createdBy,
      ...(isToday && { day: getDay() }),
    };

    const menuRes = await menuSchema.find(filterPaylaod);

    if (!menuRes) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.MENU_NOT_FOUND,
      });
    }

    // -------if menu found then

    return successHelper(
      res,
      messageStatic.MENU_SENT_SUCCESSFULLY,

      statusVar.SUCCESS,
      {
        data: menuRes,
      },
    );
  } catch (error) {
    console.log("error:------->", error);
    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

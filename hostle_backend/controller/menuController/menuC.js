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

// --------update s3eselcted meny

export const updateMenu = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;

    const {
      menuId,
      mealType,
      name,
      imageUrl,
      foodId,
      imgId,
      // -------------to edit main desc and title
      description,
      title,
      date,
      // -------------meal schema's desc
      mealSchemaDesc,
      newFoods,
    } = req.body;
    // console.log("req.body:----->", req.body);

    // const updateRes = await menuSchema.updateOne(
    //   { _id: menuId },
    //   {
    //     $set: {
    //       [`${mealType}.foods.$[food].name`]: name,
    //       [`${mealType}.foods.$[food].images.$[imageObj].url`]: imageUrl,
    //     },
    //   },
    //   {
    //     arrayFilters: [
    //       {
    //         "food._id": foodId,
    //       },
    //       {
    //         "imageObj._id": imgId,
    //       },
    //     ],
    //   },
    // );

    // ---------to edit main desc and title
    const update = {
      ...(description && { description }),
      ...(title && { title }),
      ...(date && { date }),
    };

    const arrayFilters = [];

    // ----------------used to add new food either in lunch || breakfast || dinner

    // if(newFoods)
    // {
    //   update[`${mealType}.foods`]

    // }

    // -----------mealSchemaDesc

    if (mealSchemaDesc) {
      update[`${mealType}.description`] = mealSchemaDesc;
    }

    // -----------------to edit menu's image and desc

    if (name) {
      update[`${mealType}.foods.$[food].name`] = name;

      arrayFilters.push({
        "food._id": foodId,
      });
    }

    if (imageUrl) {
      update[`${mealType}.foods.$[food].images.$[imageObj].url`] = imageUrl;

      if (!arrayFilters.some((obj) => obj["food._id"])) {
        arrayFilters.push({
          "food._id": foodId,
        });
      }

      arrayFilters.push({
        "imageObj._id": imgId,
      });
    }

    // ---------------------------- dynamic 2nd argument adding

    const mongoUpdate = {};

    if (Object.keys(update).length > 0 && update) {
      mongoUpdate.$set = update;
    }

    if (Object.keys(newFoods).length > 0 && newFoods) {
      mongoUpdate.$push = {
        [`${mealType}.foods`]: newFoods,
      };
    }

    const updateRes = await menuSchema.updateOne(
      { _id: menuId, createdBy },
      mongoUpdate,
      {
        arrayFilters,
      },
    );

    if (updateRes.modifiedCount === 0) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.MENU_NOT_FOUND,
      });
    }

    return successHelper(res, messageStatic.MENU_UPDATED, statusVar.SUCCESS);
  } catch (error) {
    console.log("error:------->", error);
    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

// ---------------delete menu.

export const deleteMenu = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;

    // menuId : this is used to delete entire menu of monday || tuesday etc
    // where this id will be only for selective deletion of menu's image || breakfast, lunch, dinner

    const { menuId, id, foodType, foodId, imgId } =
      req.validated?.query ?? req.query;

    let paylaod;
    const arrayFilters = [];

    const filterVar = {
      _id: menuId || id,
      createdBy: createdBy,
    };

    // --------if not filter id then

    if (!menuId) {
      if (foodId) {
        paylaod = { [`${foodType}.foods`]: { _id: foodId } };
      }

      if (imgId) {
        paylaod = { [`${foodType}.foods.$[food].images`]: { _id: imgId } };

        arrayFilters.push({
          "food._id": foodId,
        });
      }
    }

    let deleteRes;

    if (menuId) {
      deleteRes = await menuSchema.deleteOne(filterVar);
    } else {
      deleteRes = await menuSchema.updateOne(
        filterVar,
        {
          $pull: paylaod,
        },
        {
          arrayFilters,
        },
      );
    }

    console.log("deleteRes:------->", deleteRes);

    if (deleteRes.deletedCount === 0) {
      return errorHelper(res, {
        status: statusVar.NOT_FOUND,
        message: messageStatic.MENU_NOT_FOUND,
      });
    }

    return successHelper(
      res,
      messageStatic.DELETED_SUCCESSFULLY,
      statusVar.SUCCESS,
    );
  } catch (error) {
    console.log("error:------->", error);

    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

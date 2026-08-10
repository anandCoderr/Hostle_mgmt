import {
  errorHelper,
  successHelper,
} from "../../common/helper/globalHelper.js";
import { messageStatic } from "../../common/static/messageStatic.js";
import { statusVar } from "../../common/static/statusCodeVar.js";
import menuSchema from "../../modal/menu/hostleMenu.js";
import likeModel from "../../modal/menu/likeMenu.js";

// ------------------like fucntion

const dislikeDescFun = async (mealType, menu, food, amount, isLiked) => {
  return await menuSchema.updateOne(
    { _id: menu },
    {
      $inc: { [`${mealType}.foods.$[food].likeCount`]: amount },
      $set: { [`${mealType}.foods.$[food].isLiked`]: isLiked },
    },
    {
      arrayFilters: [
        {
          "food._id": food,
        },
      ],
    },
  );
};

export const likeController = async (req, res) => {
  try {
    const { _id: user } = req.user;
    const { menu, mealType, food, isLiked } = req.body;

    // --------Disliked is found

    const likeModelRes = await likeModel.deleteOne({
      user,
      menu,
      mealType,
      food,
    });

    if (likeModelRes.deletedCount > 0) {
      const updateRes = await dislikeDescFun(mealType, menu, food, -1, isLiked);

      if (!updateRes || updateRes.modifiedCount === 0) {
        console.log("updateRes:------->", updateRes);
        console.log("dislike functionality must have not worked");

        return errorHelper(res, {
          status: statusVar.SERVER_ERROR,
          message: messageStatic.SERVER_ERROR,
        });
      }

      return successHelper(res, messageStatic.LIKED_UNDU, statusVar.SUCCESS);
    }

    // -------------liked if available

    const likeModelCreate = likeModel({
      user,
      menu,
      mealType,
      food,
    });

    const likeModelCreateRes = await likeModelCreate.save();

    if (!likeModelCreateRes) {
      return errorHelper(res, {
        status: statusVar.SERVER_ERROR,
        message: messageStatic.SERVER_ERROR,
      });
    }

    const updateRes = await dislikeDescFun(mealType, menu, food, 1, isLiked);

    if (!updateRes || updateRes.modifiedCount === 0) {
      console.log("updateRes:------->", updateRes);
      console.log("dislike functionality must have not worked");

      return errorHelper(res, {
        status: statusVar.SERVER_ERROR,
        message: messageStatic.SERVER_ERROR,
      });
    }

    return successHelper(res, messageStatic.SUCCESS_LIKED, statusVar.SUCCESS);
  } catch (error) {
    console.log("error:", error);
    return errorHelper(res, {
      status: statusVar.SERVER_ERROR,
      message: messageStatic.SERVER_ERROR,
    });
  }
};

import menuSchema from "../../modal/menu/hostleMenu";

export const getUserMenus = async (req, res) => {
  try {
    const { _id: createdBy } = req.user;

    const { type = "WEEKLY", isToday = false } = req.query;

    // -filter

    const filterPaylaod = {
      type,
      createdBy: createdBy,
      ...(isToday && { day: getDay().toUpperCase() }),
    };

    console.log("filterPaylaod:----->", filterPaylaod);

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

import menuSchema from "../../modal/menu/hostleMenu.js";

const addMenu = async (req, res) => {
  try {
    const { type, day, date, description, title, breakfast, lunch, dinner } =
      req.body;
  } catch (error) {
    console.log("error:-------->", error);
  }
};

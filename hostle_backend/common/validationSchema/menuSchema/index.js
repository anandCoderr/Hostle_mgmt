import { z } from "zod";
import {
  descriptionSchemaFun,
  nameRequiredSchema,
  nameSchemaFun,
} from "../_commonSchema.js";
import { deleteMenu } from "../../../controller/menuController/menuC.js";
import { objectId, optionalObjectId } from "../mongoIdSchema/mongoIdSchema.js";

const weekDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const foodRule = z.object({
  name: nameSchemaFun("Food name"),

  images: z
    .array(
      z.object({
        url: z.string().url("Food image must be a valid URL"),
      }),
    )
    .min(1, "At least one food image is required"),
});

const mealRule = z.object({
  foods: z.array(foodRule).default([]),

  description: descriptionSchemaFun(
    "Meal description must be at least 2 characters",
  ),
});

// Fields shared by both menu types
const commonMenuRule = {
  title: nameSchemaFun("Title"),
  description: descriptionSchemaFun(),

  breakfast: mealRule.optional(),
  lunch: mealRule.optional(),
  dinner: mealRule.optional(),
};

// `day` is accepted only for WEEKLY.
const weeklyMenuRule = z
  .object({
    type: z.literal("WEEKLY"),
    day: z.enum(weekDays, {
      message: "Please select a valid day",
    }),
    ...commonMenuRule,
  })
  .strict();

// `date` is accepted only for SPECIAL.
// z.coerce.date() accepts the date string sent from JSON/frontend
// and converts it into a JavaScript Date.
const specialMenuRule = z
  .object({
    type: z.literal("SPECIAL"),
    date: z.coerce.date({
      message: "A valid special-menu date is required",
    }),
    ...commonMenuRule,
  })
  .strict();

// -----------------related delete functionality

const DeleteMenuSchema = z.object({
  menuId: objectId(),
});

const DeleteFoodSchema = z.object({
  id: objectId(),
  foodType: z.enum(["breakfast", "lunch", "dinner"]),
  foodId: optionalObjectId(),
  imgId: optionalObjectId(),
});

// ----------------all menu validation container

export const menuValidate = (type) => {
  const allSchema = {
    addMenuRule: z.discriminatedUnion("type", [
      weeklyMenuRule,
      specialMenuRule,
    ]),
    // ------------update menu
    updateMenuRule: z.object({
      menuId: nameRequiredSchema("Menu Id"),
      mealType: z.enum(["breakfast", "lunch", "dinner"]).optional(),
      name: descriptionSchemaFun("Food name must be at least 2 characters"),
      imageUrl: z.string().url("Food image must be a valid URL").optional(),
      foodId: descriptionSchemaFun("Food Id is requred to modify"),
      imgId: descriptionSchemaFun("Img Id is requred to modify"),
      // -------------to edit main desc and title
      description: descriptionSchemaFun(),
      title: descriptionSchemaFun("Food Title must be at least 2 characters"),
      date: z.coerce
        .date({
          message: "A valid special-menu date is required",
        })
        .optional(),
      // -------------meal schema's desc
      mealSchemaDesc: descriptionSchemaFun(),
      newFoods: foodRule.optional(),
    }),

    // -----------------delte menu

    deleteMenuRule: z.union([DeleteMenuSchema, DeleteFoodSchema]),
  };

  return allSchema[type];
};

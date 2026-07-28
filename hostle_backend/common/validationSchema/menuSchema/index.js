import { z } from "zod";
import { descriptionSchemaFun, nameSchemaFun } from "../_commonSchema.js";

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

export const menuValidate = (type) => {
  const allSchema = {
    addMenuRule: z.discriminatedUnion("type", [
      weeklyMenuRule,
      specialMenuRule,
    ]),
  };

  return allSchema[type];
};

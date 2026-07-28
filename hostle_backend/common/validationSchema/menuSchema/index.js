import { z } from "zod";
import { descriptionSchemaFun, nameSchemaFun } from "../_commonSchema.js";

export const menuValidate = (type) => {
  const allSchema = {
    addMenuRule: z.object({
      type: z.enum(["WEEKLY", "SPECIAL"]),
      day: z.enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ]),
      date: z.date(),
      description: descriptionSchemaFun(),
      title: nameSchemaFun("Title"),
      breakfast,
      lunch,
      dinner,
    }),
  };

  return allSchema[type];
};

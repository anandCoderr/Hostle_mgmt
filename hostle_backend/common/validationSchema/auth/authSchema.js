import { z } from "zod";
import {
  emailSchema,
  nameSchemaFun,
  passwordSchema,
  phoneNumSchemaFun,
} from "../_commonSchema.js";

export const userRegisterValidate = (type) => {
  const allSchema = {
    registerRule: z.object({
      name: nameSchemaFun(),
      email: emailSchema,
      room: nameSchemaFun("Room Number"),
      phone: phoneNumSchemaFun(),
      password: passwordSchema(),
    }),
  };

  return allSchema[type];
};

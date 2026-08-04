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
    userLoginRule: z.object({
      email: emailSchema,
      password: passwordSchema(),
    }),
  };

  return allSchema[type];
};

// ---------admin auth schema

export const adminRegisterValidate = (type) => {
  const allSchema = {
    adminRegisterRule: z.object({
      name: nameSchemaFun(),
      email: emailSchema,
      mobile: phoneNumSchemaFun(),
      password: passwordSchema(),
    }),

    adminLoginRule: z.object({
      email: emailSchema,
      password: passwordSchema(),
    }),
  };

  return allSchema[type];
};

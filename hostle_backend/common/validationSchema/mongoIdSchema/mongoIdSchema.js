import { z } from "zod";
import mongoose from "mongoose";

export const objectId = (field = "ID") =>
  z
    .string()
    .min(1, `${field} is required`)
    .refine(mongoose.Types.ObjectId.isValid, `Invalid ${field}`);

export const optionalObjectId = (field = "ID") =>
  z
    .string()
    .refine(mongoose.Types.ObjectId.isValid, `Invalid ${field}`)
    .optional();

import { z } from "zod";

// email

export const emailSchema = z
  .string()
  .trim()
  .nonempty("Email is required")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format");

// name

export const nameSchema = z
  .string()
  .nonempty("Name is required")
  .min(2, "Name is too short")
  .max(50, "Name too long");

// -----------------------fucntion version of nameSchema

export const nameSchemaFun = (namePlaceholder = "Name") => {
  return z
    .string()
    .trim()
    .nonempty(`${namePlaceholder} is required`)
    .min(2, `${namePlaceholder} is too short`)
    .max(25, `${namePlaceholder} too long`);
};

// --------------password

export const passwordSchema = () =>
  z
    .string()
    .trim()
    .nonempty("Password is required")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      "Password must contain 8+ chars, 1 uppercase, 1 number, 1 special character",
    );

//   ---------------------------------------------------------------------descriptionSchema

// -------------------role: optional but if started writing then it must be atleast 2 characters
export const descriptionSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val.length >= 2, {
    message: "Description must be at least 2 characters",
  });

// --------------------------------------------new

export const descriptionSchemaFun = (
  message = "Description must be at least 2 characters",
) => {
  return z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: message,
    });
};

// --------------------non empty description

//   -------------------------------------------------------------------priceSchema
export const priceSchema = z
  .string()
  .trim()
  .nonempty("Base price is required")
  .refine((v) => !isNaN(Number(v)), {
    message: "Base price must be a number",
  })
  .transform((v) => Number(v))
  .refine((v) => v > 0, {
    message: "Base price must be greater than 0",
  });

// export const priceSchemaFun = (namePlaceholder = "Base price") => {
//   return z
//     .string()
//     .trim()
//     .nonempty(`${namePlaceholder} is required`)
//     .refine((v) => !isNaN(Number(v)), {
//       message: `${namePlaceholder} must be a number`,
//     })
//     .transform((v) => Number(v))
//     .refine((v) => v > 0, {
//       message: ` ${namePlaceholder} must be greater than 0`,
//     });
// };

export const priceSchemaFun = (namePlaceholder = "Base price") => {
  return z
    .string()
    .trim()
    .nonempty(`${namePlaceholder} is required`)
    .refine((v) => !isNaN(Number(v)) && v.trim() !== "", {
      message: `${namePlaceholder} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${namePlaceholder} must be greater than 0`,
    })
    .refine((v) => Number(v) >= 0.1, {
      message: `${namePlaceholder} must be at least 0.1`,
    });
};

//   -----------------------------------------------------imageSchema
export const imageSchema = z
  .any()
  .refine((file) => file instanceof File, {
    message: "Image is required",
  })
  .refine(
    (file) =>
      !file || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    {
      message: "Invalid image type",
    },
  );

//   -------------------------------------------------------------edit Image schema

export const editImageSchema = z
  .union([z.instanceof(File), z.string().url(), z.undefined()])
  .optional();

//   --------------------------------option schema

export const optionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .nullable()
  .refine((v) => v !== null, {
    message: "Please select an option",
  });

// ----------------------------------------------------------multiSelectSchema
export const multiSelectSchema = z
  .array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  )
  .min(1, "Select at least one service");

// ------

export const multiSelectSchemaFun = (name = "service") => {
  return z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .min(1, `Select at least one ${name}`);
};

export const phoneNumSchemaFun = (namePlaceholder = "Mobile Number") => {
  return z
    .string()
    .trim()
    .min(10, "Number must be atleast 10 digits")
    .max(10, "Number must be atleast 10 digits")
    .nonempty(`${namePlaceholder} is required`)
    .refine((v) => !isNaN(Number(v)) && v.trim() !== "", {
      message: `${namePlaceholder} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${namePlaceholder} must be greater than 0`,
    })
    .refine(
      //------for indian mobile number used this
      (v) =>
        v.startsWith("6") ||
        v.startsWith("7") ||
        v.startsWith("8") ||
        v.startsWith("9"),
      {
        message: `${namePlaceholder} must be Indian no. and must start with either 6, 7, 8, or 9.`,
      },
    );
};

export const phoneNumSchemaFunUK = (namePlaceholder = "Mobile Number") => {
  return z
    .string()
    .trim()
    .min(10, "Number must be atleast 10 digits")
    .max(10, "Number must be atleast 10 digits")
    .nonempty(`${namePlaceholder} is required`)
    .refine((v) => !isNaN(Number(v)) && v.trim() !== "", {
      message: `${namePlaceholder} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${namePlaceholder} must be greater than 0`,
    })
    .refine((v) => v.startsWith("7"), {
      message: `${namePlaceholder} must be a UK no. and must start with 7.`,
    });
};

export const phoneNumSchemaFunUKOptional = (
  namePlaceholder = "Mobile Number",
) => {
  return z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.length >= 6, {
      message: "Number must be atleast 6 digits",
    })
    .refine((v) => !v || v.length <= 15, {
      message: "Number must be atleast 15 digits",
    })
    .refine((v) => !v || (!isNaN(Number(v)) && v.trim() !== ""), {
      message: `${namePlaceholder} must be a number`,
    })
    .refine((v) => !v || Number(v) > 0, {
      message: `${namePlaceholder} must be greater than 0`,
    });
  // .refine((v) => !v || v.startsWith("7"), {
  //   message: `${namePlaceholder} must be a UK no. and must start with 7.`,
  // });
};

// -------------------image who can hold bith obj type and url

export const imageSchemaWithFlexibility = z.any().refine(
  (value) => {
    if (value === undefined || value === null) return true;

    if (value instanceof File) return true;

    if (typeof value === "string" && value.trim().length > 0) {
      // return value.startsWith("http");
      return true;
    }

    return false;
  },
  {
    message: "Image must be a File or a valid URL",
  },
);

// -------multiple image upload schema:

export const multipleImagesSchema = z
  .any()
  .refine(
    (files) => {
      // Check if it's a FileList (from input.files) or array
      if (files instanceof FileList) {
        return files.length > 0;
      }
      // Check if it's an array
      if (Array.isArray(files)) {
        return files.length > 0;
      }
      return false;
    },
    {
      message: "At least one image is required",
    },
  )
  .refine(
    (files) => {
      // Convert to array for consistent processing
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      const length = fileArray?.length || 0;

      // Skip if empty (already caught above)
      if (length === 0) return true;

      return length >= 1;
    },
    {
      message: "At least one image is required",
    },
  )
  .refine(
    (files) => {
      // Convert to array for consistent processing
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      const length = fileArray?.length || 0;

      // Skip if empty (already caught above)
      if (length === 0) return true;

      return length <= 4;
    },
    {
      message: "Maximum 4 images allowed",
    },
  )
  .refine(
    (files) => {
      // Convert to array for consistent processing
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      // If no files, skip this refinement
      if (!fileArray || fileArray.length === 0) return true;

      // Check all files have valid types
      return fileArray.every(
        (file) =>
          file instanceof File &&
          ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      );
    },
    {
      message: "All images must be JPEG, PNG, or WebP format",
    },
  );

// -----------for alpha numaric

export const forAlphaNumaricValidation = (
  name = "Coupon code",
  errMsg = "Coupon code must contain only alphanumeric characters (A-Z, a-z, 0-9)",
) =>
  z
    .string()
    .trim()
    .min(4, `${name}  must be at least 4 characters`)
    .max(20, `${name}  must be maximum 20 characters`)
    .regex(/^[a-zA-Z0-9]+$/, {
      message: errMsg,
    });

// --------number but required

export const stringBasedNumberRequired = (name = "Percentage") =>
  z
    .string()
    .trim()
    .min(1, `${name} is required`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${name} must be a number`,
    });

export const stringBasedNumberOptional = (name = "Percentage") =>
  z
    .string()
    .trim()
    .optional()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${name} must be a number`,
    })
    .refine((value) => !value || Number(value) > 0, {
      message: `${name} must be greater than 0`,
    });

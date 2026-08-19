"use client";

import { Controller } from "react-hook-form";
import { DatePicker } from "@/Components/form";

/**
 * Reusable date picker for react-hook-form + zod — wraps the shared
 * <DatePicker/> in a Controller so the field value is a `Date`.
 *
 * Required props:
 *  - name    : field name registered in the form
 *  - control : `control` returned from useForm()
 *
 * Optional (selective control) props:
 *  - label, placeholder, maxDate, minDate, disabled, required
 *  - any other prop is forwarded to the underlying <DatePicker/>
 *
 * Pair with a zod `z.date()` field.
 */
const RhfDatePicker = ({
  name,
  control,
  label,
  placeholder = "Select Date",
  maxDate,
  minDate,
  disabled = false,
  required = false,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          label={label}
          placeholder={placeholder}
          value={field.value}
          onChange={(date) => field.onChange(date)}
          error={error?.message}
          maxDate={maxDate}
          minDate={minDate}
          disabled={disabled}
          required={required}
          {...rest}
        />
      )}
    />
  );
};

export default RhfDatePicker;

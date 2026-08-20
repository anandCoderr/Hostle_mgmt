"use client";

import { useController } from "react-hook-form";
import { Input } from "@/Components/form";

/**
 * RHFInput — react-hook-form binding for the shared <Input/>.
 *
 * Required props:
 *  - name    : field name/path registered in the form (supports nested paths
 *              like "breakfast.foods.0.name")
 *  - control : `control` returned from useForm()
 *
 * Optional props:
 *  - label, placeholder, type, required, disabled, defaultValue
 *  - any other prop is forwarded to the underlying <Input/>
 *
 * ── Why this exists, and why NOT `{...register()}` ──────────────
 *
 * The shared <Input/> defaults `value = ""` and always passes it to the DOM
 * node, so it is permanently CONTROLLED. A bare `{...register(name)}` leaves
 * the value prop at "" and the field can never be typed into — "register is
 * built for UNcontrolled inputs", where RHF writes the DOM value via the ref.
 *
 * The other half of the trap: feeding it `value={watch(name)}` breaks under
 * React Compiler (`reactCompiler: true` in next.config.mjs). `watch()` is an
 * impure call — same arguments, different result as the form changes — so the
 * compiler caches the first result ("") and never calls it again. That bites
 * only inside child components the compiler actually optimises, which is why
 * the same pattern can look fine in a page component and freeze in a child.
 *
 * `useController` avoids both: it is a hook, so React Compiler treats its
 * result as reactive state instead of a memoisable pure value.
 *
 * ── Usage ───────────────────────────────────────────────────────
 *
 *   <RHFInput
 *     name={`${mealType}.foods.${index}.name`}
 *     control={control}
 *     label="Food Name"
 *     placeholder="e.g. Daal Makhani"
 *     required
 *   />
 *
 * The error message is resolved from form state automatically — no need to
 * hand-write `errors?.[mealType]?.foods?.[index]?.name?.message`.
 */
const RHFInput = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  defaultValue = "",
  ...rest
}) => {
  const {
    field: { value, onChange, onBlur, ref, name: fieldName },
    fieldState: { error },
  } = useController({ name, control, defaultValue });

  return (
    <Input
      ref={ref}
      name={fieldName}
      type={type}
      label={label}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      // `?? ""` keeps the input controlled even before a value exists —
      // passing undefined would make React flip it to uncontrolled and warn.
      value={value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      error={error?.message}
      {...rest}
    />
  );
};

export default RHFInput;

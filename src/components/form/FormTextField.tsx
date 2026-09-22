import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";

interface FormTextFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
  readonly digitsOnly?: boolean;
  readonly maxLength?: number;
}

export function FormTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  digitsOnly = false,
  maxLength,
}: FormTextFieldProps<T>) {
  const { register, clearErrors, trigger, getFieldState, formState } =
    useFormContext<T>();

  const field = register(name);

  const errorMessage = getFieldState(name, formState).error?.message;

  return (
    <div className="space-y-1">
      <Label htmlFor={String(name)}>{label}</Label>

      <Input
        id={String(name)}
        placeholder={placeholder}
        inputMode={digitsOnly ? "numeric" : undefined}
        maxLength={maxLength}
        aria-invalid={Boolean(errorMessage)}
        {...field}
        onBlur={(event) => {
          field.onBlur(event);
          void trigger(name);
        }}
        onChange={(e) => {
          if (digitsOnly) {
            e.target.value = e.target.value.replaceAll(/\D/g, "").slice(0, maxLength);
          }
          field.onChange(e);
          clearErrors(name);
        }}
      />

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  );
}

import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "./FormError";

interface FormTextFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
}

export function FormTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
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
        aria-invalid={Boolean(errorMessage)}
        {...field}
        onBlur={(event) => {
          field.onBlur(event);
          void trigger(name);
        }}
        onChange={(e) => {
          field.onChange(e);
          clearErrors(name);
        }}
      />

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  );
}

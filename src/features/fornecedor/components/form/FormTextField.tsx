import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const {
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<T>();

  const field = register(name);

  const error = errors[name];
  let errorMessage: string | undefined;

  if (typeof error?.message === "string") {
    errorMessage = error.message;
  } else if (
    typeof error?.message === "number" ||
    typeof error?.message === "boolean"
  ) {
    errorMessage = String(error.message);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>{label}</Label>

      <Input
        id={String(name)}
        placeholder={placeholder}
        {...field}
        onChange={(e) => {
          field.onChange(e);
          clearErrors(name);
        }}
      />

      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}

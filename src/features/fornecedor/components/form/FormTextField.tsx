import { FieldPath, FieldValues, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormTextFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
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

      {error && (
        <p className="text-xs text-destructive">{String(error.message)}</p>
      )}
    </div>
  );
}

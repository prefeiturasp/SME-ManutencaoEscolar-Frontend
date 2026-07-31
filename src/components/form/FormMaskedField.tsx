import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormError } from "./FormError";

interface FormMaskedFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
  readonly mask: (value: string) => string;
  readonly unmask: (value: string) => string;
}

export function FormMaskedField<T extends FieldValues>({
  name,
  label,
  placeholder,
  mask,
  unmask,
}: FormMaskedFieldProps<T>) {
  const {
    control,
    clearErrors,
    formState: { errors },
  } = useFormContext<T>();

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1">
      <Label htmlFor={String(name)}>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={String(name)}
            name={field.name}
            ref={field.ref}
            placeholder={placeholder}
            value={mask(String(field.value ?? ""))}
            aria-invalid={Boolean(errorMessage)}
            onChange={(e) => {
              field.onChange(unmask(e.target.value));
              clearErrors(name);
            }}
            onBlur={field.onBlur}
          />
        )}
      />

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  );
}

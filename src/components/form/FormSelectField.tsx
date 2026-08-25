"use client";

import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormError } from "./FormError";

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface FormSelectFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
}

export function FormSelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Selecione",
}: FormSelectFieldProps<T>) {
  const { control, clearErrors, trigger, getFieldState, formState } =
    useFormContext<T>();

  const errorMessage = getFieldState(name, formState).error?.message;

  return (
    <div className="space-y-1">
      <Label htmlFor={String(name)}>{label}</Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <Select
              value={field.value ?? ""}
              onValueChange={(value) => {
                field.onChange(value);
                clearErrors(name);
              }}
              onOpenChange={(open) => {
                if (!open) {
                  field.onBlur();
                  void trigger(name);
                }
              }}
            >
              <SelectTrigger
                id={String(name)}
                className="w-full"
                aria-invalid={Boolean(errorMessage)}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent position="popper" align="start" sideOffset={0}>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  );
}

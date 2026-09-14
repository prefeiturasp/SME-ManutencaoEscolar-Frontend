"use client";

import { useRef } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { FormError } from "./FormError";

interface FormFileFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly multiple?: boolean;
  readonly accept?: string;
  readonly className?: string;
  readonly limparAposSelecao?: boolean;
  readonly helperText?: string;
}

export function FormFileField<T extends FieldValues>({
  name,
  label,
  multiple = true,
  accept,
  className,
  limparAposSelecao = false,
  helperText = "",
}: FormFileFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { control, clearErrors, getFieldState, formState } =
    useFormContext<T>();

  const errorMessage = getFieldState(name, formState).error?.message;

  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={String(name)}>{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const arquivos = (field.value as File[] | undefined) ?? [];
          const nomesArquivos = limparAposSelecao
            ? ""
            : arquivos.map((arquivo) => arquivo.name).join(", ");

          return (
            <div className="flex">
              <Input
                id={String(name)}
                readOnly
                placeholder="Nenhum arquivo selecionado"
                value={nomesArquivos}
                aria-invalid={Boolean(errorMessage)}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer flex-1 rounded-r-none"
              />

              <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                className="hidden"
                onChange={(event) => {
                  const novosArquivos = Array.from(event.target.files ?? []);

                  field.onChange(
                    limparAposSelecao
                      ? [...arquivos, ...novosArquivos]
                      : novosArquivos,
                  );
                  clearErrors(name);
                  event.target.value = "";
                }}
              />

              <Button
                type="button"
                variant="default"
                onClick={() => inputRef.current?.click()}
                className="rounded-l-none rounded-r-md"
              >
                <Upload className="h-4 w-4" />
                Escolher arquivo
              </Button>
            </div>
          );
        }}
      />

      {!errorMessage && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {errorMessage && <FormError message={errorMessage} />}
    </div>
  );
}

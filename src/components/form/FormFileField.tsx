"use client";

import { useRef } from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { Paperclip, Trash2, Upload } from "lucide-react";

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
  readonly variant?: "default" | "documento";
  readonly description?: string;
}

export function FormFileField<T extends FieldValues>({
  name,
  label,
  multiple = true,
  accept,
  className,
  limparAposSelecao = false,
  helperText = "",
  variant = "default",
  description,
}: FormFileFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { control, clearErrors, getFieldState, formState } = useFormContext<T>();

  const errorMessage = getFieldState(name, formState).error?.message;

  const documento = variant === "documento";

  return (
    <div
      className={cn(
        "space-y-1",
        documento && "flex min-h-48 flex-col gap-4 rounded-md border p-5",
        className,
      )}
    >
      <Label htmlFor={String(name)} className={cn(documento && "font-semibold")}>
        {label}
      </Label>

      {documento && description && <p className="text-sm text-muted-foreground">{description}</p>}

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const arquivos = (field.value as File[] | undefined) ?? [];
          const nomesArquivos = limparAposSelecao
            ? ""
            : arquivos.map((arquivo) => arquivo.name).join(", ");

          return (
            <div className={cn("flex", documento && "flex flex-1 flex-col gap-6")}>
              {documento && arquivos.length > 0 && (
                <div className="flex min-w-0 items-center gap-2 rounded-md bg-[#E8F0FF] p-2 text-sm text-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded bg-white text-primary">
                    <Paperclip className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate" title={nomesArquivos}>
                    {nomesArquivos}
                  </span>
                  <button
                    type="button"
                    className="flex size-7 shrink-0 items-center justify-center rounded text-destructive hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
                    aria-label={`Remover arquivo ${nomesArquivos}`}
                    onClick={() => {
                      field.onChange([]);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              )}
              {documento && arquivos.length === 0 && (
                <div className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-blocked">
                    <Paperclip className="size-4 text-blocked-foreground" aria-hidden="true" />
                  </span>
                  <span className="text-[#BFBFC2]">Selecione um arquivo</span>
                </div>
              )}

              <Input
                id={String(name)}
                readOnly
                placeholder="Nenhum arquivo selecionado"
                value={nomesArquivos}
                aria-invalid={Boolean(errorMessage)}
                onClick={() => inputRef.current?.click()}
                className={cn("cursor-pointer flex-1 rounded-r-none", documento && "sr-only")}
              />

              <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                className="hidden"
                onChange={(event) => {
                  const novosArquivos = Array.from(event.target.files ?? []);

                  if (novosArquivos.length === 0) return;
                  field.onChange(
                    limparAposSelecao ? [...arquivos, ...novosArquivos] : novosArquivos,
                  );
                  clearErrors(name);
                  event.target.value = "";
                }}
              />

              <Button
                type="button"
                variant={documento ? "outline" : "default"}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "rounded-l-none rounded-r-md",
                  documento && "mt-auto max-w-full rounded-md",
                )}
              >
                <Upload className="h-4 w-4" />
                {documento && arquivos.length > 0 ? "Substituir arquivo" : "Escolher arquivo"}
              </Button>
            </div>
          );
        }}
      />

      {!errorMessage && helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      {errorMessage && !documento && <FormError message={errorMessage} />}
    </div>
  );
}

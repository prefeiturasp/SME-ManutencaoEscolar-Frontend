"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Opcao } from "../types/opcao.types";
import { FormError } from "./FormError";

interface FormMultiSelectFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly options: Opcao[];
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function FormMultiSelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Selecione as opções",
  disabled = false,
}: FormMultiSelectFieldProps<T>) {
  const [aberto, setAberto] = useState(false);
  const { control } = useFormContext<T>();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const valoresSelecionados: string[] = Array.isArray(field.value)
    ? field.value
    : [];

  const opcoesSelecionadas = options.filter((option) =>
    valoresSelecionados.includes(option.value),
  );

  function alterarSelecao(value: string) {
    const estaSelecionado = valoresSelecionados.includes(value);

    const novosValores = estaSelecionado
      ? valoresSelecionados.filter(
          (valorSelecionado) => valorSelecionado !== value,
        )
      : [...valoresSelecionados, value];

    field.onChange(novosValores);
  }

  return (
    <div className="w-full min-w-0 space-y-1 text-[var(--gray)]">
      <Label htmlFor={String(name)} className="text-[var(--gray)]">
        {label}
      </Label>

      <Popover
        open={aberto}
        onOpenChange={(novoEstado) => {
          setAberto(novoEstado);

          if (!novoEstado) {
            field.onBlur();
          }
        }}
      >
        <div
          className={cn(
            "relative flex min-h-10 w-full max-w-none",
            "flex-wrap items-center gap-1 rounded-md border",
            "border-input bg-[#FFFFFF] px-2 py-1 text-sm",
            error && "border-destructive ring-1 ring-destructive",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <PopoverTrigger asChild>
            <button
              id={String(name)}
              type="button"
              disabled={disabled}
              aria-label="Abrir seleção de diretorias regionais"
              className={cn(
                "absolute inset-0 z-0 w-full",
                "rounded-md border-0 bg-transparent p-0",
                "cursor-pointer focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed",
              )}
            >
              <span className="sr-only">{placeholder}</span>
            </button>
          </PopoverTrigger>

          <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-wrap gap-0.5">
            {opcoesSelecionadas.length > 0 ? (
              opcoesSelecionadas.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className={cn(
                    "flex h-7 max-w-full items-center gap-1",
                    "rounded-md border-0 bg-[#EEEEEE]",
                    "px-2 py-1 font-normal text-[var(--gray)]",
                    "hover:bg-[#EEEEEE]",
                  )}
                >
                  <span className="max-w-[250px] truncate">{option.label}</span>

                  <button
                    type="button"
                    aria-label={`Remover ${option.label}`}
                    className={cn(
                      "pointer-events-auto flex size-4 shrink-0",
                      "items-center justify-center rounded-sm",
                      "border-0 bg-transparent text-[var(--gray)]",
                      "hover:bg-[#D9D9D9] hover:text-[var(--gray)]",
                      "focus-visible:outline-none",
                      "focus-visible:ring-1",
                      "focus-visible:ring-[#06366B]",
                    )}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      alterarSelecao(option.value);
                    }}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="px-1 text-[var(--gray)]">{placeholder}</span>
            )}
          </div>

          <ChevronDown
            className="ml-2 size-4 shrink-0 text-[var(--gray)]"
            aria-hidden="true"
          />
        </div>

        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0 text-[var(--gray)]"
        >
          <Command>
            <CommandInput
              placeholder="Pesquisar..."
              className={cn(
                "text-[var(--gray)]",
                "placeholder:text-[var(--gray)]",
              )}
            />

            <CommandList>
              <CommandEmpty className="text-[var(--gray)]">
                Nenhuma diretoria regional encontrada.
              </CommandEmpty>

              <CommandGroup>
                {options.map((option) => {
                  const selecionado = valoresSelecionados.includes(
                    option.value,
                  );

                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      className="text-[var(--gray)]"
                      onSelect={() => {
                        alterarSelecao(option.value);
                      }}
                    >
                      <span className="flex-1 text-[var(--gray)]">
                        {option.label}
                      </span>

                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0 text-[var(--gray)]",
                          selecionado ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error?.message && <FormError message={String(error.message)} />}
    </div>
  );
}

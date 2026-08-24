"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
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

interface FormComboboxFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly options: Opcao[];
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly helperText?: string;
  readonly disabled?: boolean;
}

export function FormComboboxField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = "Selecione uma opção",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhuma opção encontrada.",
  helperText,
  disabled = false,
}: FormComboboxFieldProps<T>) {
  const [aberto, setAberto] = useState(false);
  const { control } = useFormContext<T>();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const opcaoSelecionada = options.find(
    (option) => option.value === field.value,
  );

  function selecionarOpcao(value: string) {
    field.onChange(value);
    setAberto(false);
  }

  return (
    <div className="w-full space-y-1 text-[var(--gray)]">
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
        <PopoverTrigger asChild>
          <Button
            id={String(name)}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 w-full max-w-none justify-between",
              "border-[#D9D9D9] bg-[#FFFFFF] px-3 font-normal",
              "text-[var(--gray)]",

              // Mantém o fundo branco em todos os estados
              "hover:border-[#D9D9D9] hover:bg-[#FFFFFF]",
              "hover:text-[var(--gray)]",
              "focus-visible:border-[#D9D9D9]",
              "focus-visible:bg-[#FFFFFF]",
              "focus-visible:text-[var(--gray)]",
              "focus-visible:ring-0",
              "aria-expanded:bg-[#FFFFFF]",
              "aria-expanded:text-[var(--gray)]",
              "data-[state=open]:border-[#D9D9D9]",
              "data-[state=open]:bg-[#FFFFFF]",
              "data-[state=open]:text-[var(--gray)]",

              error && "border-destructive ring-1 ring-destructive",
            )}
          >
            <span className="truncate text-left text-[var(--gray)]">
              {opcaoSelecionada?.label ?? placeholder}
            </span>

            <ChevronDown
              className={cn(
                "ml-2 size-4 shrink-0 text-[var(--gray)]",
                "transition-transform",
                aberto && "rotate-180",
              )}
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          sideOffset={4}
          align="start"
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            "text-[var(--gray)]",
          )}
        >
          <Command className="text-[var(--gray)]">
            <CommandInput
              placeholder={searchPlaceholder}
              className={cn(
                "text-[var(--gray)]",
                "placeholder:text-[var(--gray)]",
              )}
            />

            <CommandList className="text-[var(--gray)]">
              <CommandEmpty className="text-[var(--gray)]">
                {emptyMessage}
              </CommandEmpty>

              <CommandGroup>
                {options.map((option) => {
                  const selecionado = option.value === field.value;

                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      className={cn(
                        "text-[var(--gray)]",
                        "data-[selected=true]:text-[var(--gray)]",
                      )}
                      onSelect={() => {
                        selecionarOpcao(option.value);
                      }}
                    >
                      <span className="flex-1 text-[var(--gray)]">
                        {option.label}
                      </span>

                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          "text-[var(--gray)]",
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

      {helperText && <p className="text-xs text-[var(--gray)]">{helperText}</p>}

      {error?.message && <FormError message={String(error.message)} />}
    </div>
  );
}

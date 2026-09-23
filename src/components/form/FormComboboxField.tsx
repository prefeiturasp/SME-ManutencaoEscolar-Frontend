"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { FieldPath, FieldValues, useController, useFormContext } from "react-hook-form";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Opcao } from "@/components/types/opcao.types";
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
  readonly onValueChange?: (value: string) => void;
}

function normalizarPesquisa(valor: string): string {
  return valor
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
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
  onValueChange,
}: FormComboboxFieldProps<T>) {
  const [aberto, setAberto] = useState(false);
  const { control, trigger } = useFormContext<T>();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const opcaoSelecionada = options.find((option) => option.value === field.value);

  function selecionarOpcao(value: string) {
    field.onChange(value);
    setAberto(false);
    onValueChange?.(value);
    void trigger(name);
  }

  return (
    <div className="w-full space-y-1 text-gray">
      <Label htmlFor={String(name)} className="text-gray">
        {label}
      </Label>

      <Popover
        open={aberto}
        onOpenChange={(novoEstado) => {
          setAberto(novoEstado);

          if (!novoEstado) {
            field.onBlur();
            void trigger(name);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={String(name)}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-10 w-full max-w-none justify-between rounded-md",
              "bg-popover px-3 font-normal",
              "text-gray",
              "hover:bg-popover",
              "hover:text-gray",
              "focus-visible:border-ring",
              "focus-visible:bg-popover",
              "focus-visible:text-gray",
              "focus-visible:ring-[3px]",
              "focus-visible:ring-ring/50",
              "data-[state=open]:border-ring",
              "data-[state=open]:bg-popover",
              "data-[state=open]:text-gray",
              "data-[state=open]:ring-[3px]",
              "data-[state=open]:ring-ring/50",
              "disabled-base",
              !error && "border-[#D9D9D9] hover:border-[#D9D9D9]",
              error && "border-destructive hover:border-destructive",
            )}
          >
            <span className="truncate text-left text-gray">
              {opcaoSelecionada?.label ?? placeholder}
            </span>

            <ChevronDown
              className={cn(
                "ml-2 size-4 shrink-0 text-gray",
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
          className={cn("w-(--radix-popover-trigger-width) rounded-md p-0", "text-gray")}
        >
          <Command
            className="rounded-md text-gray"
            filter={(value, search) => {
              const valorNormalizado = normalizarPesquisa(value);
              const pesquisaNormalizada = normalizarPesquisa(search);

              return valorNormalizado.includes(pesquisaNormalizada) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={searchPlaceholder}
              className={cn("text-gray", "placeholder:text-gray")}
            />

            <CommandList className="text-gray">
              <CommandEmpty className="text-gray">{emptyMessage}</CommandEmpty>

              <CommandGroup>
                {options.map((option) => {
                  const selecionado = option.value === field.value;

                  const cnpjSemFormatacao = option.cnpj?.replaceAll(/\D/g, "") ?? "";
                  return (
                    <CommandItem
                      key={option.value}
                      value={[option.label, option.cnpj ?? "", cnpjSemFormatacao].join(" ")}
                      className={cn("text-gray", "data-[selected=true]:text-gray")}
                      onSelect={() => {
                        selecionarOpcao(option.value);
                      }}
                    >
                      <span className="flex-1 text-gray">{option.label}</span>

                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          "text-gray",
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

      {helperText && <p className="text-xs text-gray">{helperText}</p>}

      {error?.message && <FormError message={String(error.message)} />}
    </div>
  );
}

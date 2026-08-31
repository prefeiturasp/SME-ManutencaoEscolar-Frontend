"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import type { FiltroListaOption } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FiltroComboBoxFieldProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly FiltroListaOption[];
  readonly onBlur?: () => void;
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
}

const QUANTIDADE_MINIMA_PARA_PESQUISA = 5;

function normalizarPesquisa(valor: string): string {
  return valor
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

export function FiltroComboBoxField({
  id,
  value,
  onChange,
  options,
  onBlur,
  placeholder = "Selecione",
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhuma opção encontrada.",
  disabled = false,
  "aria-label": ariaLabel,
}: FiltroComboBoxFieldProps) {
  const [aberto, setAberto] = useState(false);

  const opcaoSelecionada = options.find((option) => option.value === value);

  function selecionarOpcao(novoValor: string) {
    onChange(novoValor === value ? "" : novoValor);
    setAberto(false);
  }

  return (
    <Popover
      open={aberto}
      onOpenChange={(novoEstado) => {
        setAberto(novoEstado);

        if (!novoEstado) {
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            "w-full max-w-none justify-between",
            "border-input bg-white px-3 font-normal",
            "data-[state=open]:border-ring",
            "data-[state=open]:ring-[3px]",
            "data-[state=open]:ring-ring/50",
            "text-gray rounded-md",
            "data-[state=open]:bg-white",
            "data-[state=open]:text-gray",
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
        avoidCollisions={false}
        side="bottom"
        sideOffset={4}
        align="start"
        style={{
          translate: "0 -1px",
        }}
        className="w-(--radix-popover-trigger-width) p-0 text-gray"
      >
        <Command
          className="text-gray"
          filter={(valorItem, pesquisa) => {
            const valorNormalizado = normalizarPesquisa(valorItem);
            const pesquisaNormalizada = normalizarPesquisa(pesquisa);

            return valorNormalizado.includes(pesquisaNormalizada) ? 1 : 0;
          }}
        >
          {options.length > QUANTIDADE_MINIMA_PARA_PESQUISA && (
            <CommandInput
              placeholder={searchPlaceholder}
              className="text-gray placeholder:text-gray"
            />
          )}

          <CommandList className="text-gray">
            <CommandEmpty className="text-gray py-2 text-center">
              {emptyMessage}
            </CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const selecionado = option.value === value;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    className={cn(
                      "text-gray",
                      "data-[selected=true]:text-gray",
                    )}
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
  );
}

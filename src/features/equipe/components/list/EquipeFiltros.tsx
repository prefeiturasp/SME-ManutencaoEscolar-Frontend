"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FiltroEquipeValues, OpcaoFiltroEquipe } from "@/features/equipe/types/equipe.types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

type EquipeFiltrosProps = {
  valores: FiltroEquipeValues;
  opcoesEmpresas: OpcaoFiltroEquipe[];
  opcoesLotes: OpcaoFiltroEquipe[];
  onMudar: (campo: keyof FiltroEquipeValues, valor: string) => void;
  onBuscar: () => void;
  onLimpar: () => void;
};

export function EquipeFiltros({
  valores,
  opcoesEmpresas,
  opcoesLotes,
  onMudar,
  onBuscar,
  onLimpar,
}: Readonly<EquipeFiltrosProps>) {
  const [campoAberto, setCampoAberto] = useState<"empresa" | "lote" | null>(null);

  function renderizarPesquisa(
    campo: "empresa" | "lote",
    label: string,
    opcoes: OpcaoFiltroEquipe[],
  ) {
    const aberta = campoAberto === campo;
    const selecionada = opcoes.find((opcao) => opcao.value === valores[campo]);

    return (
      <div className="flex w-full min-w-0 flex-col gap-1">
        <Label htmlFor={`equipe-${campo}`} className="text-sm font-bold text-gray">
          {label}
        </Label>
        <Popover open={aberta} onOpenChange={(open) => setCampoAberto(open ? campo : null)}>
          <PopoverTrigger asChild>
            <Button
              id={`equipe-${campo}`}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={aberta}
              className={cn(
                "h-10 !w-full min-w-0 max-w-none justify-between rounded-md",
                "border border-input bg-[#FFFFFF] px-3 font-normal text-[var(--gray)] shadow-xs",
                "hover:bg-[#FFFFFF] hover:text-[var(--gray)]",
                "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                "data-[state=open]:border-ring data-[state=open]:bg-[#FFFFFF] data-[state=open]:ring-[3px] data-[state=open]:ring-ring/50",
              )}
            >
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-left",
                  selecionada ? "text-[var(--gray)]" : "text-muted-foreground",
                )}
              >
                {selecionada?.label ?? "Selecione"}
              </span>
              <ChevronDown
                className={cn(
                  "ml-2 size-4 shrink-0 text-muted-foreground transition-transform",
                  aberta && "rotate-180",
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
            className="w-[var(--radix-popover-trigger-width)] rounded-md p-0 text-[var(--gray)]"
          >
            <Command className="rounded-md text-[var(--gray)]">
              <CommandInput
                placeholder={
                  campo === "empresa"
                    ? "Digite o nome da empresa..."
                    : "Digite o nome ou código do lote..."
                }
                className="text-[var(--gray)] placeholder:text-[var(--gray)]"
              />
              <CommandList>
                <CommandEmpty>
                  {campo === "empresa" ? "Nenhuma empresa encontrada." : "Nenhum lote encontrado."}
                </CommandEmpty>
                <CommandGroup>
                  {opcoes.map((opcao) => (
                    <CommandItem
                      key={opcao.value}
                      value={[opcao.label, opcao.value].join(" ")}
                      className={cn(
                        "text-[var(--gray)]",
                        valores[campo] === opcao.value && "bg-[#EEEEEE]",
                      )}
                      onSelect={() => {
                        onMudar(campo, opcao.value);
                        setCampoAberto(null);
                      }}
                    >
                      <span className="flex-1 text-[var(--gray)]">{opcao.label}</span>
                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0 text-[var(--gray)]",
                          valores[campo] === opcao.value ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  function renderizarSelecao(campo: "status", label: string, opcoes: OpcaoFiltroEquipe[]) {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <Label htmlFor={`equipe-${campo}`} className="text-sm font-bold text-gray">
          {label}
        </Label>
        <Select value={valores[campo]} onValueChange={(valor) => onMudar(campo, valor)}>
          <SelectTrigger id={`equipe-${campo}`} className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {opcoes.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <form
      className="mb-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onBuscar();
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="equipe-nome" className="text-sm font-bold text-gray">
            Nome da equipe
          </Label>
          <Input
            id="equipe-nome"
            placeholder="Exemplo: Serralheria Leste"
            value={valores.nome}
            onChange={(event) => onMudar("nome", event.target.value)}
          />
        </div>
        {renderizarPesquisa("empresa", "Empresa", opcoesEmpresas)}
        {renderizarPesquisa("lote", "Lote", opcoesLotes)}
        {renderizarSelecao("status", "Situação", [
          { label: "Ativo", value: "ativo" },
          { label: "Inativo", value: "inativo" },
        ])}
      </div>
      <div className="flex flex-wrap justify-end gap-4">
        <Button type="button" variant="outline" size="big-lg" onClick={onLimpar}>
          Limpar filtros
        </Button>
        <Button type="submit" variant="outline" size="big-lg">
          <Search />
          Buscar equipe
        </Button>
      </div>
    </form>
  );
}

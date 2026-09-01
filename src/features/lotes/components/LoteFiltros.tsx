"use client";

import { DateRangeField } from "@/components/shared/DateRangeField/DateRangeField";
import { Badge } from "@/components/ui/badge";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";

import type {
  OpcaoFiltroLote,
  StatusFiltroLote,
} from "@/features/lotes/types/lotes.types";

interface LoteFiltrosProps {
  readonly codigoCadastro: string;
  readonly nome: string;
  readonly status: StatusFiltroLote;
  readonly empresa: string;
  readonly diretoriasRegionais: string[];
  readonly periodoInicial: string;
  readonly periodoFinal: string;

  readonly opcoesEmpresas: readonly OpcaoFiltroLote[];
  readonly opcoesDiretoriasRegionais: readonly OpcaoFiltroLote[];

  readonly onMudarCodigoCadastro: (value: string) => void;
  readonly onMudarNome: (value: string) => void;
  readonly onMudarStatus: (value: StatusFiltroLote) => void;
  readonly onMudarEmpresa: (value: string) => void;
  readonly onMudarDiretoriasRegionais: (values: string[]) => void;
  readonly onMudarPeriodoInicial: (value: string) => void;
  readonly onMudarPeriodoFinal: (value: string) => void;
  readonly onBuscar: () => void;
  readonly onLimpar: () => void;
}

export function LoteFiltros({
  codigoCadastro,
  nome,
  status,
  empresa,
  diretoriasRegionais,
  periodoInicial,
  periodoFinal,
  opcoesEmpresas,
  opcoesDiretoriasRegionais,
  onMudarCodigoCadastro,
  onMudarNome,
  onMudarStatus,
  onMudarEmpresa,
  onMudarDiretoriasRegionais,
  onMudarPeriodoInicial,
  onMudarPeriodoFinal,
  onBuscar,
  onLimpar,
}: Readonly<LoteFiltrosProps>) {
  const [dreAberta, setDreAberta] = useState(false);

  const [empresaAberta, setEmpresaAberta] = useState(false);

  const opcoesDiretoriasSelecionadas = opcoesDiretoriasRegionais.filter(
    (opcao) => diretoriasRegionais.includes(opcao.value),
  );

  const empresaSelecionada = opcoesEmpresas.find(
    (opcao) => opcao.value === empresa,
  );

  function alternarDiretoriaRegional(value: string) {
    const selecionada = diretoriasRegionais.includes(value);

    if (selecionada) {
      onMudarDiretoriasRegionais(
        diretoriasRegionais.filter((diretoriaId) => diretoriaId !== value),
      );

      return;
    }

    onMudarDiretoriasRegionais([...diretoriasRegionais, value]);
  }

  function removerDiretoriaRegional(value: string) {
    onMudarDiretoriasRegionais(
      diretoriasRegionais.filter((diretoriaId) => diretoriaId !== value),
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="codigo-cadastro"
            className="text-sm font-bold text-[var(--background-gray)]"
          >
            Código de cadastro
          </Label>

          <Input
            id="codigo-cadastro"
            value={codigoCadastro}
            placeholder="Digite o código de cadastro"
            onChange={(event) => {
              onMudarCodigoCadastro(event.target.value);
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label
            htmlFor="nome"
            className="text-sm font-bold text-[var(--background-gray)]"
          >
            Nome
          </Label>

          <Input
            id="nome"
            value={nome}
            placeholder="Digite o nome do lote"
            onChange={(event) => {
              onMudarNome(event.target.value);
            }}
          />
        </div>

        <div className="w-full min-w-0 space-y-1 text-[var(--gray)]">
          <Label htmlFor="diretorias-regionais" className="text-[var(--gray)]">
            DRE
          </Label>

          <Popover open={dreAberta} onOpenChange={setDreAberta}>
            <div
              className={cn(
                "relative flex min-h-10 w-full max-w-none",
                "flex-wrap items-center gap-1 rounded-md border",
                "border-input bg-[#FFFFFF] px-2 py-1 text-sm",
                dreAberta && "border-ring ring-[3px] ring-ring/50",
              )}
            >
              <PopoverTrigger asChild>
                <button
                  id="diretorias-regionais"
                  type="button"
                  aria-label="Abrir seleção de diretorias regionais"
                  aria-expanded={dreAberta}
                  className={cn(
                    "absolute inset-0 z-0 w-full",
                    "cursor-pointer rounded-md border-0",
                    "bg-transparent p-0",
                    "focus-visible:outline-none",
                    "focus-visible:ring-0",
                  )}
                >
                  <span className="sr-only">Selecione uma ou mais DREs</span>
                </button>
              </PopoverTrigger>

              <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 flex-wrap gap-0.5">
                {opcoesDiretoriasSelecionadas.length > 0 ? (
                  opcoesDiretoriasSelecionadas.map((opcao) => (
                    <Badge
                      key={opcao.value}
                      variant="secondary"
                      className={cn(
                        "flex h-7 max-w-full items-center gap-1",
                        "rounded-md border-0 bg-[#EEEEEE]",
                        "px-2 py-1 font-normal",
                        "text-[var(--gray)]",
                        "hover:bg-[#EEEEEE]",
                      )}
                    >
                      <span className="max-w-[250px] truncate">
                        {opcao.label}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remover ${opcao.label}`}
                        className={cn(
                          "pointer-events-auto flex size-4 shrink-0",
                          "items-center justify-center rounded-sm",
                          "border-0 bg-transparent",
                          "text-[var(--gray)]",
                          "hover:bg-[#D9D9D9]",
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

                          removerDiretoriaRegional(opcao.value);
                        }}
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="px-1 text-[var(--gray)]">
                    Selecione uma ou mais opções
                  </span>
                )}
              </div>

              <ChevronDown
                className={cn(
                  "ml-2 size-4 shrink-0",
                  "text-[var(--gray)] transition-transform",
                  dreAberta && "rotate-180",
                )}
                aria-hidden="true"
              />
            </div>

            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={4}
              className={cn(
                "w-[var(--radix-popover-trigger-width)]",
                "rounded-md p-0 text-[var(--gray)]",
              )}
            >
              <Command className="rounded-md">
                <CommandInput
                  placeholder="Pesquisar DRE..."
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
                    {opcoesDiretoriasRegionais.map((opcao) => {
                      const selecionada = diretoriasRegionais.includes(
                        opcao.value,
                      );

                      return (
                        <CommandItem
                          key={opcao.value}
                          value={`${opcao.label} ${opcao.value}`}
                          className="text-[var(--gray)]"
                          onSelect={() => {
                            alternarDiretoriaRegional(opcao.value);
                          }}
                        >
                          <span className="flex-1 text-[var(--gray)]">
                            {opcao.label}
                          </span>

                          <Check
                            className={cn(
                              "ml-auto size-4 shrink-0",
                              "text-[var(--gray)]",
                              selecionada ? "opacity-100" : "opacity-0",
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
        </div>

        <div className="flex flex-col gap-1">
          <Label
            htmlFor="status"
            className="text-sm font-bold text-[var(--background-gray)]"
          >
            Status
          </Label>

          <Select
            value={status}
            onValueChange={(value) => {
              if (value === "ativo" || value === "inativo") {
                onMudarStatus(value);
              }
            }}
          >
            <SelectTrigger
              id="status"
              className={cn(
                "w-full",
                "data-[state=open]:border-ring",
                "data-[state=open]:ring-[3px]",
                "data-[state=open]:ring-ring/50",
              )}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectItem value="ativo">Ativo</SelectItem>

              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-1">
          <Label className="text-sm font-bold text-[var(--background-gray)]">
            Empresa
          </Label>

          <Popover open={empresaAberta} onOpenChange={setEmpresaAberta}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={empresaAberta}
                className={cn(
                  "h-10 !w-full min-w-0 max-w-none",
                  "justify-between rounded-md",
                  "border border-input bg-[#FFFFFF] px-3",
                  "font-normal text-[var(--gray)] shadow-xs",

                  "hover:bg-[#FFFFFF]",
                  "hover:text-[var(--gray)]",

                  "focus-visible:border-ring",
                  "focus-visible:ring-[3px]",
                  "focus-visible:ring-ring/50",

                  "data-[state=open]:border-ring",
                  "data-[state=open]:bg-[#FFFFFF]",
                  "data-[state=open]:ring-[3px]",
                  "data-[state=open]:ring-ring/50",
                )}
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-left",
                    empresaSelecionada
                      ? "text-[var(--gray)]"
                      : "text-muted-foreground",
                  )}
                >
                  {empresaSelecionada?.label ?? "Digite o nome da empresa..."}
                </span>

                <ChevronDown
                  className={cn(
                    "ml-2 size-4 shrink-0",
                    "text-muted-foreground",
                    "transition-transform",
                    empresaAberta && "rotate-180",
                  )}
                />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={4}
              avoidCollisions={false}
              className={cn(
                "w-[var(--radix-popover-trigger-width)] rounded-md p-0",
                "text-[var(--gray)]",
              )}
            >
              <Command className="rounded-md text-[var(--gray)]">
                <CommandInput
                  placeholder="Digite o CNPJ ou nome da empresa..."
                  className={cn(
                    "text-[var(--gray)]",
                    "placeholder:text-[var(--gray)]",
                  )}
                />

                <CommandList className="text-[var(--gray)]">
                  <CommandEmpty className="text-[var(--gray)]">
                    Nenhuma empresa encontrada.
                  </CommandEmpty>

                  <CommandGroup>
                    {opcoesEmpresas.map((opcao) => {
                      const selecionada = empresa === opcao.value;

                      return (
                        <CommandItem
                          key={opcao.value}
                          value={[opcao.label, opcao.value].join(" ")}
                          className={cn(
                            "text-[var(--gray)]",
                            selecionada && "bg-[#EEEEEE]",
                          )}
                          onSelect={() => {
                            onMudarEmpresa(opcao.value);
                            setEmpresaAberta(false);
                          }}
                        >
                          <span className="flex-1 text-[var(--gray)]">
                            {opcao.label}
                          </span>

                          <Check
                            className={cn(
                              "ml-auto size-4 shrink-0",
                              "text-[var(--gray)]",
                              selecionada ? "opacity-100" : "opacity-0",
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
        </div>

        <DateRangeField
          id="periodo-licitacao-filtro"
          dataInicial={periodoInicial}
          dataFinal={periodoFinal}
          label="Período da licitação"
          onMudarDataInicial={onMudarPeriodoInicial}
          onMudarDataFinal={onMudarPeriodoFinal}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          size="big-lg"
          onClick={onLimpar}
          className="max-w-[117px]"
        >
          Limpar filtros
        </Button>

        <Button
          type="button"
          variant="outline"
          size="big-lg"
          onClick={onBuscar}
          className="max-w-[143px]"
        >
          <Search />
          Buscar lotes
        </Button>
      </div>
    </section>
  );
}

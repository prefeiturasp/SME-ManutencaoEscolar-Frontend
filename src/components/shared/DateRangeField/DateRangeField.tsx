"use client";

import {
  addMonths,
  addYears,
  format,
  isValid,
  parseISO,
  startOfMonth,
  subMonths,
  subYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";

import { FormError } from "@/components/form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFieldProps {
  readonly id: string;
  readonly dataInicial: string;
  readonly dataFinal: string;
  readonly label: string;
  readonly disabled?: boolean;
  readonly mensagemErro?: string;
  readonly variant?: DateRangeFieldVariant;
  readonly onMudarDataInicial: (value: string) => void;
  readonly onMudarDataFinal: (value: string) => void;
  readonly onFechar?: () => void;
}

type DateRangeFieldVariant = "form" | "filter";

function converterStringParaData(valor: string): Date | undefined {
  if (!valor) {
    return undefined;
  }

  const data = parseISO(valor);

  return isValid(data) ? data : undefined;
}

function formatarData(data?: Date): string {
  if (!data) {
    return "00/00/0000";
  }

  return format(data, "dd/MM/yyyy", {
    locale: ptBR,
  });
}

export function DateRangeField({
  id,
  dataInicial,
  dataFinal,
  label,
  disabled = false,
  mensagemErro,
  variant = "form",
  onMudarDataInicial,
  onMudarDataFinal,
  onFechar,
}: Readonly<DateRangeFieldProps>) {
  const [aberto, setAberto] = useState(false);

  const [mesExibido, setMesExibido] = useState(startOfMonth(new Date()));

  const dataInicialConvertida = converterStringParaData(dataInicial);

  const dataFinalConvertida = converterStringParaData(dataFinal);

  const intervaloSelecionado: DateRange | undefined = dataInicialConvertida
    ? {
        from: dataInicialConvertida,
        to: dataFinalConvertida,
      }
    : undefined;

  function selecionarIntervalo(intervalo: DateRange | undefined) {
    if (!intervalo?.from) {
      onMudarDataInicial("");
      onMudarDataFinal("");
      return;
    }

    onMudarDataInicial(format(intervalo.from, "yyyy-MM-dd"));

    onMudarDataFinal(intervalo.to ? format(intervalo.to, "yyyy-MM-dd") : "");

    const intervaloCompleto =
      intervalo.to && intervalo.from.getTime() !== intervalo.to.getTime();

    if (intervaloCompleto) {
      setAberto(false);
      onFechar?.();
    }
  }

  function formatarNomeMes(data: Date): string {
    const mes = format(data, "MMM", {
      locale: ptBR,
    }).replace(".", "");

    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }
  const ehFiltro = variant === "filter";

  return (
    <div
      className={cn(
        "w-full",
        ehFiltro ? "flex flex-col gap-1" : "space-y-1 text-[var(--gray)]",
      )}
    >
      <Label
        htmlFor={id}
        className={cn(
          ehFiltro
            ? "text-sm font-bold text-[var(--background-gray)]"
            : "text-[var(--gray)]",
        )}
      >
        {label}
      </Label>

      <Popover
        open={aberto}
        onOpenChange={(novoEstado) => {
          setAberto(novoEstado);

          if (novoEstado && dataInicialConvertida) {
            setMesExibido(startOfMonth(dataInicialConvertida));
          }

          if (!novoEstado) {
            onFechar?.();
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center rounded-md",
              "border border-input bg-white px-3",
              "text-left text-sm",
              "focus-visible:outline-none",
              "focus-visible:border-ring",
              "focus-visible:ring-[3px]",
              "focus-visible:ring-ring/50",
              "data-[state=open]:border-ring",
              "data-[state=open]:ring-[3px]",
              "data-[state=open]:ring-ring/50",
              mensagemErro && "border-destructive ring-1 ring-destructive",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className={cn(
                "flex-1",
                !dataInicialConvertida && "text-muted-[var(--gray)]",
              )}
            >
              {formatarData(dataInicialConvertida)}
            </span>

            <ArrowRight
              className="mx-3 size-4 shrink-0 text-[#BDBDBD]"
              aria-hidden="true"
            />

            <span
              className={cn(
                "flex-1",
                !dataFinalConvertida && "text-muted-[var(--gray)]",
              )}
            >
              {formatarData(dataFinalConvertida)}
            </span>

            <CalendarDays
              className="ml-3 size-5 shrink-0 text-[#9E9E9E]"
              aria-hidden="true"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          sideOffset={4}
          align="start"
          avoidCollisions={false}
          className="w-[308px] rounded-none border-0 bg-white p-0 text-[var(--gray)] shadow-lg"
        >
          <div className="flex h-12 items-center border-b px-2">
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Voltar um ano"
                className="flex size-8 items-center justify-center text-[var(--gray)] hover:text-[var(--gray)]"
                onClick={() => {
                  setMesExibido((mesAtual) => subYears(mesAtual, 1));
                }}
              >
                <ChevronsLeft className="size-5" />
              </button>

              <button
                type="button"
                aria-label="Voltar um mês"
                className="flex size-8 items-center justify-center text-[#D0D0D0] hover:text-[var(--gray)]"
                onClick={() => {
                  setMesExibido((mesAtual) => subMonths(mesAtual, 1));
                }}
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>

            <div className="flex flex-1 justify-center gap-5 text-base font-semibold">
              <span>{format(mesExibido, "yyyy")}</span>

              <span>{formatarNomeMes(mesExibido)}</span>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                aria-label="Avançar um mês"
                className="flex size-8 items-center justify-center text-[#D0D0D0] hover:text-[var(--gray)]"
                onClick={() => {
                  setMesExibido((mesAtual) => addMonths(mesAtual, 1));
                }}
              >
                <ChevronRight className="size-5" />
              </button>

              <button
                type="button"
                aria-label="Avançar um ano"
                className="flex size-8 items-center justify-center text-[#D0D0D0] hover:text-[var(--gray)]"
                onClick={() => {
                  setMesExibido((mesAtual) => addYears(mesAtual, 1));
                }}
              >
                <ChevronsRight className="size-5" />
              </button>
            </div>
          </div>

          <DayPicker
            mode="range"
            min={1}
            resetOnSelect
            locale={ptBR}
            month={mesExibido}
            onMonthChange={setMesExibido}
            selected={intervaloSelecionado}
            onSelect={selecionarIntervalo}
            hideNavigation
            showOutsideDays
            classNames={{
              root: "w-full p-1",
              months: "w-full",
              month: "w-full",
              month_caption: "hidden",
              month_grid: "w-full border-collapse",
              weekdays: "flex border-b",
              weekday: cn(
                "flex size-10 items-center justify-center",
                "text-xs font-normal text-[var(--gray)]",
              ),
              weeks: "w-full",
              week: "flex w-full",
              day: "flex size-10 items-center " + "justify-center p-0",
              day_button: cn(
                "flex size-9 items-center justify-center",
                "rounded-md text-sm text-[var(--gray)]",
                "hover:text-[var(--gray)]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[#022B5D]",
              ),
              today: "font-semibold",
              selected: "",
              range_start: cn(
                "rounded-md bg-[#022B5D]",
                "[&>button]:text-white",
                "[&>button:hover]:text-white",
              ),
              range_middle: cn(
                "bg-[#E6EEF7]",
                "[&>button]:text-[var(--gray)]",
                "[&>button:hover]:text-[var(--gray)]",
              ),
              range_end: cn(
                "rounded-md bg-[#022B5D]",
                "[&>button]:text-white",
                "[&>button:hover]:text-white",
              ),
              outside: "text-[#BDBDBD]",
              disabled: "text-[#BDBDBD] opacity-50",
              hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
      {mensagemErro && <FormError message={mensagemErro} />}
    </div>
  );
}

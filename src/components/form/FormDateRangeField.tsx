"use client";

import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import {
  FieldPath,
  FieldValues,
  useController,
  useFormContext,
} from "react-hook-form";

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
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormError } from "./FormError";

interface FormDateRangeFieldProps<T extends FieldValues> {
  readonly nameInicial: FieldPath<T>;
  readonly nameFinal: FieldPath<T>;
  readonly label: string;
  readonly disabled?: boolean;
}

function converterStringParaData(valor: unknown): Date | undefined {
  if (typeof valor !== "string" || !valor) {
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

export function FormDateRangeField<T extends FieldValues>({
  nameInicial,
  nameFinal,
  label,
  disabled = false,
}: FormDateRangeFieldProps<T>) {
  const [aberto, setAberto] = useState(false);
  const { control, trigger } = useFormContext<T>();
  const [mesExibido, setMesExibido] = useState(startOfMonth(new Date()));

  const {
    field: campoInicial,
    fieldState: { error: erroInicial },
  } = useController({
    name: nameInicial,
    control,
  });

  const {
    field: campoFinal,
    fieldState: { error: erroFinal },
  } = useController({
    name: nameFinal,
    control,
  });

  const dataInicial = converterStringParaData(campoInicial.value);

  const dataFinal = converterStringParaData(campoFinal.value);

  const intervaloSelecionado: DateRange | undefined = dataInicial
    ? {
        from: dataInicial,
        to: dataFinal,
      }
    : undefined;

  const mensagemErro = erroInicial?.message ?? erroFinal?.message;

  function selecionarIntervalo(intervalo: DateRange | undefined) {
    if (!intervalo?.from) {
      campoInicial.onChange("");
      campoFinal.onChange("");
      return;
    }

    campoInicial.onChange(format(intervalo.from, "yyyy-MM-dd"));

    campoFinal.onChange(intervalo.to ? format(intervalo.to, "yyyy-MM-dd") : "");

    const intervaloCompleto =
      intervalo.from &&
      intervalo.to &&
      intervalo.from.getTime() !== intervalo.to.getTime();

    if (intervaloCompleto) {
      setAberto(false);
      validarPeriodo();
    }
  }

  function validarPeriodo() {
    campoInicial.onBlur();
    campoFinal.onBlur();

    queueMicrotask(() => {
      void trigger([nameInicial, nameFinal]);
    });
  }

  function formatarNomeMes(data: Date): string {
    const mes = format(data, "MMM", {
      locale: ptBR,
    }).replace(".", "");

    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }

  return (
    <div className="w-full space-y-1">
      <Label htmlFor={`${String(nameInicial)}-periodo`}>{label}</Label>

      <Popover
        open={aberto}
        onOpenChange={(novoEstado) => {
          setAberto(novoEstado);

          if (novoEstado && dataInicial) {
            setMesExibido(startOfMonth(dataInicial));
          }

          if (!novoEstado) {
            validarPeriodo();
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={`${String(nameInicial)}-periodo`}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center rounded-md",
              "border border-input bg-[#FFFFFF] px-3",
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
                !dataInicial && "text-muted-[var(--gray)]",
              )}
            >
              {formatarData(dataInicial)}
            </span>

            <ArrowRight
              className="mx-3 size-4 shrink-0 text-[#BDBDBD]"
              aria-hidden="true"
            />

            <span
              className={cn("flex-1", !dataFinal && "text-muted-[var(--gray)]")}
            >
              {formatarData(dataFinal)}
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
              day: "flex size-10 items-center justify-center p-0",

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

      {mensagemErro && <FormError message={String(mensagemErro)} />}
    </div>
  );
}

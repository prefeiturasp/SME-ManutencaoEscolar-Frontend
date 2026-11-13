"use client";

import type { FieldPath, FieldValues } from "react-hook-form";
import { useController, useFormContext } from "react-hook-form";

import { DateRangeField } from "@/components/shared/DateRangeField/DateRangeField";

interface FormDateRangeFieldProps<T extends FieldValues> {
  readonly nameInicial: FieldPath<T>;
  readonly nameFinal: FieldPath<T>;
  readonly label: string;
  readonly disabled?: boolean;
}

export function FormDateRangeField<T extends FieldValues>({
  nameInicial,
  nameFinal,
  label,
  disabled = false,
}: FormDateRangeFieldProps<T>) {
  const { control, trigger } = useFormContext<T>();

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

  const mensagemErro = erroInicial?.message ?? erroFinal?.message;

  function validarPeriodo() {
    campoInicial.onBlur();
    campoFinal.onBlur();

    queueMicrotask(() => {
      void trigger([nameInicial, nameFinal]);
    });
  }

  return (
    <DateRangeField
      id={`${String(nameInicial)}-periodo`}
      dataInicial={
        typeof campoInicial.value === "string" ? campoInicial.value : ""
      }
      dataFinal={typeof campoFinal.value === "string" ? campoFinal.value : ""}
      label={label}
      disabled={disabled}
      mensagemErro={mensagemErro ? String(mensagemErro) : undefined}
      onMudarDataInicial={campoInicial.onChange}
      onMudarDataFinal={campoFinal.onChange}
      onFechar={validarPeriodo}
    />
  );
}

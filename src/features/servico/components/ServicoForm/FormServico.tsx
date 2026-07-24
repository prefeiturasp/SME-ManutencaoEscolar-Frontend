"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ServiceFormData } from "../../schemas/servicoSchema";

export function FormServico() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ServiceFormData>();

  return (
    <div className="flex gap-4">
      <div className="flex flex-1 flex-col gap-2">
        <label
          htmlFor="nome"
          className="text-sm font-bold text-muted-foreground"
        >
          Serviço
        </label>

        <Input
          id="nome"
          placeholder="Digite o nome do serviço..."
          aria-invalid={Boolean(errors.nome)}
          {...register("nome")}
        />

        {errors.nome && (
          <span className="text-sm text-destructive">
            {errors.nome.message}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <label
          htmlFor="status"
          className="text-sm font-bold text-muted-foreground"
        >
          Status
        </label>

        <Controller
          name="status"
          control={control}
          render={({ field }) => {
            let valorSelecionado: "ativo" | "inativo" | undefined;

            if (field.value === true) {
              valorSelecionado = "ativo";
            } else if (field.value === false) {
              valorSelecionado = "inativo";
            }

            return (
              <Select
                value={valorSelecionado}
                onValueChange={(value) => {
                  field.onChange(value === "ativo");
                }}
              >
                <SelectTrigger
                  id="status"
                  className="w-full"
                  aria-invalid={Boolean(errors.status)}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>

                <SelectContent position="popper" align="start" sideOffset={0}>
                  <SelectItem value="ativo">Ativo</SelectItem>

                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
      </div>
    </div>
  );
}

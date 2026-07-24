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
          htmlFor="service_name"
          className="text-sm font-bold text-muted-foreground"
        >
          Serviço
        </label>

        <Input
          id="service_name"
          placeholder="Digite o nome do serviço..."
          aria-invalid={Boolean(errors.service_name)}
          {...register("service_name")}
        />

        {errors.service_name && (
          <span className="text-sm text-destructive">
            {errors.service_name.message}
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
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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
          )}
        />

        {errors.status && (
          <span className="text-sm text-destructive">
            {errors.status.message}
          </span>
        )}
      </div>
    </div>
  );
}

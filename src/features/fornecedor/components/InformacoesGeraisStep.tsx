"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { maskCep, maskCnpj, unmaskCep, unmaskCnpj } from "@/utils/formatadores";
import { Copy, Info } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";
import { ESTADOS, STATUS_OPCOES } from "../../../constants";
import type { FornecedorSchema } from "../schemas/fornecedor.schema";
import { FormSection } from "./form/FormSection";
import { FormTextField } from "./form/FormTextField";

export function InformacoesGeraisStep() {
  const {
    register,
    control,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<FornecedorSchema>();

  const linkRastreio = watch("link_rastreio");

  return (
    <div className="space-y-8">
      <FormSection
        title="Dados da empresa"
        description="Preencha os dados da empresa."
      >
        <div className="grid grid-cols-2 gap-4">
          <FormTextField<FornecedorSchema>
            name="nome"
            label="Nome"
            placeholder="Nome"
          />

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={maskCnpj(field.value ?? "")}
                  onChange={(e) => {
                    field.onChange(unmaskCnpj(e.target.value));
                    clearErrors("cnpj");
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              )}
            />
            {errors.cnpj && (
              <p className="text-[12px] text-destructive">
                {errors.cnpj.message}
              </p>
            )}
          </div>

          <FormTextField<FornecedorSchema>
            name="razao_social"
            label="Razão social"
            placeholder="Razão social"
          />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={
                    field.value === undefined ? undefined : String(field.value)
                  }
                  onValueChange={(value) => {
                    field.onChange(value === "true");
                    clearErrors("status");
                  }}
                  onOpenChange={(open) => {
                    if (!open) {
                      field.onBlur();
                    }
                  }}
                >
                  <SelectTrigger
                    id="status"
                    className="w-full"
                    onBlur={() => {
                      field.onBlur();
                    }}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" sideOffset={0}>
                    {STATUS_OPCOES.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-[12px] text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="link_rastreio">Link de rastreio (opcional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="w-57 text-center">
                  Link para acompanhamento em tempo real da localização da van
                  vinculada à equipe de manutenção.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="link_rastreio"
                  placeholder="https://"
                  className="pr-10"
                  {...register("link_rastreio")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 text-blocked-foreground -translate-y-1/2"
                  onClick={() =>
                    navigator.clipboard.writeText(linkRastreio ?? "")
                  }
                  aria-label="Copiar link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "bg-white",
                  linkRastreio ? "" : "text-gray border-blocked-foreground",
                )}
                disabled={!linkRastreio}
                onClick={() =>
                  linkRastreio && window.open(linkRastreio, "_blank")
                }
              >
                Abrir link
              </Button>
            </div>
            {errors.link_rastreio ? (
              <p className="text-[12px] text-destructive">
                {errors.link_rastreio.message}
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                O endereço deve começar com &quot;http://&quot; ou
                &quot;https://&quot;.
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Localização"
        description="Preencha os dados de localização da empresa."
      >
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={maskCep(field.value ?? "")}
                  {...register("cep")}
                  onChange={(e) => {
                    field.onChange(unmaskCep(e.target.value));
                    clearErrors("cep");
                  }}
                />
              )}
            />
            {errors.cep && (
              <p className="text-[12px] text-destructive">
                {errors.cep.message}
              </p>
            )}
          </div>

          <FormTextField<FornecedorSchema>
            name="logradouro"
            label="Logradouro"
            placeholder="Logradouro"
          />

          <FormTextField<FornecedorSchema>
            name="numero"
            label="Número"
            placeholder="Número"
          />

          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento (opcional)</Label>
            <Input
              id="complemento"
              placeholder="Digite o complemento..."
              {...register("complemento")}
            />
          </div>

          <FormTextField<FornecedorSchema>
            name="cidade"
            label="Cidade"
            placeholder="Cidade"
          />

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <Select
                  value={
                    field.value === undefined ? undefined : String(field.value)
                  }
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearErrors("estado");
                  }}
                  onOpenChange={(open) => {
                    if (!open) {
                      field.onBlur();
                    }
                  }}
                >
                  <SelectTrigger
                    id="estado"
                    className="w-full"
                    onBlur={() => {
                      field.onBlur();
                    }}
                  >
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" sideOffset={0}>
                    {ESTADOS.map((uf) => (
                      <SelectItem
                        key={uf.value}
                        value={uf.value}
                        className={
                          uf.value === undefined
                            ? "text-muted-foreground/70"
                            : ""
                        }
                      >
                        {uf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && (
              <p className="text-[12px] text-destructive">
                {errors.estado.message}
              </p>
            )}
          </div>
        </div>
      </FormSection>
    </div>
  );
}

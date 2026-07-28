"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Copy, ExternalLink, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { ESTADOS, STATUS_OPCOES } from "../../../constants";
import { maskCep, maskCnpj, unmaskCep, unmaskCnpj } from "@/utils/formatadores";
import type { FornecedorSchema } from "../schemas/fornecedor.schema";

export function InformacoesGeraisStep() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<FornecedorSchema>();

  const linkRastreio = watch("link_rastreio");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Dados da empresa</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados de identificação e cadastro da empresa.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" placeholder="Nome" {...register("nome")} />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

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
                  onChange={(e) => field.onChange(unmaskCnpj(e.target.value))}
                />
              )}
            />
            {errors.cnpj && (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input
              id="razao_social"
              placeholder="Razão social"
              {...register("razao_social")}
            />
            {errors.razao_social && (
              <p className="text-sm text-destructive">
                {errors.razao_social.message}
              </p>
            )}
          </div>

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
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger id="status" className="w-full">
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
              <p className="text-sm text-destructive">
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
                <TooltipContent>
                  Link para acompanhamento em tempo real da localização da van
                  vinculada à equipe de manutenção.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Input
                id="link_rastreio"
                placeholder="https://"
                {...register("link_rastreio")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigator.clipboard.writeText(linkRastreio ?? "")
                }
                aria-label="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!linkRastreio}
                onClick={() =>
                  linkRastreio && window.open(linkRastreio, "_blank")
                }
              >
                <ExternalLink className="h-10 w-4" />
                Abrir link
              </Button>
            </div>
            {errors.link_rastreio ? (
              <p className="text-sm text-destructive">
                {errors.link_rastreio.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                O endereço deve começar com &quot;http://&quot; ou
                &quot;https://&quot;.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Localização</h2>
          <p className="text-sm text-muted-foreground">
            Preencha os dados de localização da empresa.
          </p>
        </div>

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
                  onChange={(e) => field.onChange(unmaskCep(e.target.value))}
                />
              )}
            />
            {errors.cep && (
              <p className="text-sm text-destructive">{errors.cep.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              placeholder="Logradouro"
              {...register("logradouro")}
            />
            {errors.logradouro && (
              <p className="text-sm text-destructive">
                {errors.logradouro.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" placeholder="Número" {...register("numero")} />
            {errors.numero && (
              <p className="text-sm text-destructive">
                {errors.numero.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento (opcional)</Label>
            <Input
              id="complemento"
              placeholder="Digite o complemento..."
              {...register("complemento")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" placeholder="Cidade" {...register("cidade")} />
            {errors.cidade && (
              <p className="text-sm text-destructive">
                {errors.cidade.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="estado" className="w-full">
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" sideOffset={0}>
                    {ESTADOS.map((uf) => (
                      <SelectItem
                        key={uf.value}
                        value={uf.value}
                        className={
                          uf.value === "" ? "text-muted-foreground/70" : ""
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
              <p className="text-sm text-destructive">
                {errors.estado.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

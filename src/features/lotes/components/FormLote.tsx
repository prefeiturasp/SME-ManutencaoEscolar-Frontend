"use client";

import {
  FormDateRangeField,
  FormSelectField,
  FormTextField,
} from "@/components/form";
import { FormComboboxField } from "@/components/form/FormComboboxField";
import { FormMultiSelectField } from "@/components/form/FormMultiSelectField";
import { Opcao } from "@/components/types/opcao.types";
import { STATUS_OPCOES } from "@/constants/constants";
import type { LoteFormData } from "@/features/lotes/schemas/loteSchema";

type FormLoteProps = {
  empresasOpcoes: Opcao[];
  diretoriasRegionaisOpcoes: Opcao[];
};

export function FormLote({
  empresasOpcoes,
  diretoriasRegionaisOpcoes,
}: Readonly<FormLoteProps>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormTextField<LoteFormData>
          name="codigo_cadastro"
          label="Código de cadastro"
          placeholder="Digite o código..."
        />

        <FormTextField<LoteFormData>
          name="nome"
          label="Nome"
          placeholder="Digite o nome do lote"
        />
      </div>

      <div className="w-full">
        <FormMultiSelectField<LoteFormData>
          name="diretorias_regionais"
          label="DRE"
          placeholder="Selecione uma ou mais opções"
          options={diretoriasRegionaisOpcoes}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
        <FormSelectField<LoteFormData>
          name="status"
          label="Status"
          placeholder="Selecione"
          options={STATUS_OPCOES}
        />

        <FormComboboxField<LoteFormData>
          name="empresa"
          label="Empresa"
          placeholder="Digite o nome da empresa..."
          searchPlaceholder="Digite o CNPJ ou nome da empresa..."
          emptyMessage="Nenhuma empresa encontrada."
          helperText="Pesquise pelo CNPJ ou nome da empresa"
          options={empresasOpcoes}
        />
        <FormDateRangeField<LoteFormData>
          nameInicial="periodo_inicial"
          nameFinal="periodo_final"
          label="Período da licitação"
        />
      </div>
    </div>
  );
}

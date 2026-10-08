"use client";

import { FormSelectField, FormTextField } from "@/components/form";
import { FormComboboxField } from "@/components/form/FormComboboxField";
import type { Opcao } from "@/components/types/opcao.types";
import { STATUS_OPCOES } from "@/constants/constants";
import type { EquipeFormData } from "../schema/equipeSchema";

type FormEquipeProps = {
  empresasOpcoes: Opcao[];
  lotesOpcoes: Opcao[];
};

export function FormEquipe({ empresasOpcoes, lotesOpcoes }: Readonly<FormEquipeProps>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FormTextField<EquipeFormData>
          name="nome"
          label="Nome da equipe"
          placeholder="Digite o nome da equipe"
        />

        <FormSelectField<EquipeFormData>
          name="situacao"
          label="Situação"
          placeholder="Selecione"
          options={STATUS_OPCOES}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FormComboboxField<EquipeFormData>
          name="empresa"
          label="Empresa"
          tooltip="Apenas empresas com situação de cadastro “ativa” serão exibidas."
          placeholder="Selecione a empresa"
          searchPlaceholder="Pesquisar..."
          emptyMessage="Nenhuma empresa encontrada."
          helperText="Busque pelo CNPJ, nome social ou código."
          options={empresasOpcoes}
        />

        <FormComboboxField<EquipeFormData>
          name="lote"
          label="Lote"
          placeholder="Selecione o lote"
          searchPlaceholder="Pesquisar..."
          options={lotesOpcoes}
        />
      </div>
    </div>
  );
}

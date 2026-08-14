"use client";

import { ESTADOS, STATUS_OPCOES } from "../../../../constants/constants";
import { maskCep, maskCnpj, unmaskCep, unmaskCnpj } from "@/utils/formatadores";
import type { EmpresaSchema } from "../../schemas/empresa.schema";
import {
  FormSection,
  FormTextField,
  FormSelectField,
  FormMaskedField,
  FormLinkField,
} from "@/components/form";

export function InformacoesGeraisStep() {
  return (
    <div className="space-y-8">
      <FormSection
        title="Dados da empresa"
        description="Preencha os dados da empresa."
      >
        <div className="grid grid-cols-2 gap-4">
          <FormTextField<EmpresaSchema>
            name="nome"
            label="Nome"
            placeholder="Nome"
          />

          <FormMaskedField<EmpresaSchema>
            name="cnpj"
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            mask={maskCnpj}
            unmask={unmaskCnpj}
          />

          <FormTextField<EmpresaSchema>
            name="razao_social"
            label="Razão social"
            placeholder="Razão social"
          />

          <FormSelectField
            name="status"
            label="Status"
            options={STATUS_OPCOES}
          />

          <FormLinkField<EmpresaSchema>
            name="link_rastreio"
            label="Link de rastreio (opcional)"
            placeholder="https://"
            tooltip="Link para acompanhamento em tempo real da localização da van vinculada à equipe de manutenção."
            helperText='O endereço deve começar com "http://" ou "https://".'
            className="col-span-2"
          />
        </div>
      </FormSection>

      <FormSection
        title="Localização"
        description="Preencha os dados de localização da empresa."
      >
        <div className="grid grid-cols-3 gap-4">
          <FormMaskedField<EmpresaSchema>
            name="cep"
            label="CEP"
            placeholder="00000-000"
            mask={maskCep}
            unmask={unmaskCep}
          />

          <FormTextField<EmpresaSchema>
            name="logradouro"
            label="Logradouro"
            placeholder="Logradouro"
          />

          <FormTextField<EmpresaSchema>
            name="numero"
            label="Número"
            placeholder="Número"
          />

          <FormTextField<EmpresaSchema>
            name="complemento"
            label="Complemento (opcional)"
            placeholder="Digite o complemento..."
          />

          <FormTextField<EmpresaSchema>
            name="cidade"
            label="Cidade"
            placeholder="Cidade"
          />

          <FormSelectField<EmpresaSchema>
            name="estado"
            label="Estado"
            placeholder="Selecione um estado"
            options={ESTADOS}
          />
        </div>
      </FormSection>
    </div>
  );
}

"use client";

import {
    FormMaskedField,
    FormSection,
    FormSelectField,
    FormTextField
} from "@/components/form";
import { ESTADOS } from "@/constants/constants";
import { STATUS_OPTIONS } from "@/features/unidade_educacional/constants";
import { maskCep, maskTelefone, unmaskCep, unmaskTelefone } from "@/utils/formatadores";

type SelectOption = {
  value: string;
  label: string;
};

type InformacoesGeraisUnidadeEducacionalProps = {
  tiposUnidades: SelectOption[];
  diretoriasRegionais: SelectOption[];
  subprefeituras: SelectOption[];
};


export function InformacoesGeraisUnidadeEducacional({
    tiposUnidades, diretoriasRegionais, subprefeituras
}: InformacoesGeraisUnidadeEducacionalProps) {
  return (
    <div className="space-y-8">
        <FormSection
                title="Informações da UE"
                description="Dados de identificação da Unidade Educacional"
            > 
            <div className="grid grid-cols-2 gap-2">
                <FormTextField
                    name="codigo_eol"
                    label="CODESC (Código EOL)"
                />
                 <FormSelectField
                    name="tipo_escola"
                    label="Tipo de escola"
                    options={tiposUnidades}
                />
                 <FormSelectField
                    name="diretoria_regional"
                    label="Diretoria Regional de Educação (DRE)"
                    options={diretoriasRegionais}
                />
                 <FormTextField
                    name="nome"
                    label="Unidade Educacional"
                />
            </div>
            <div className="grid grid-cols-4 gap-4">
                <FormSelectField
                    name="subprefeitura"
                    label="Subprefeitura"
                    options={subprefeituras}
                />
                 <FormTextField
                    name="lote"
                    label="Lote"
                />
                 <FormSelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                />
                 <FormMaskedField
                    name="telefone"
                    label="Telefone"
                    mask={maskTelefone}
                    unmask={unmaskTelefone}
                />
            </div>
             <div className="grid grid-cols-1 gap-1">
                <FormTextField
                    name="email"
                    label="E-mail"
                />
            </div>
        </FormSection>
        <FormSection
                title="Localização da UE"
                description="Dados de localização da Unidade Educacional"
            > 
            <div className="grid grid-cols-[401px_1fr] gap-2">
                <FormMaskedField
                    name="cep"
                    label="CEP"
                    mask={maskCep}
                    unmask={unmaskCep}
                />
                 <FormTextField
                    name="logradouro"
                    label="Logradouro"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                 <FormTextField
                    name="numero"
                    label="Número"
                />
                <FormTextField
                    name="bairro"
                    label="Bairro"
                />
                <FormTextField
                    name="cidade"
                    label="Cidade"
                />
                <FormSelectField
                    name="estado"
                    label="Estado"
                    options={ESTADOS}
                />
            </div>
        </FormSection>
    </div>
  );
}

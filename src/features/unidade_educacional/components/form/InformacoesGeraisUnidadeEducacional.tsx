"use client";

import {
    FormMaskedField,
    FormSection,
    FormSelectField,
    FormTextField
} from "@/components/form";
import { ESTADOS, STATUS_OPCOES } from "@/constants/constants";
import { maskCep, maskTelefone, unmaskCep, unmaskTelefone } from "@/utils/formatadores";

type SelectOption = {
  readonly value: string;
  readonly label: string;
};

type InformacoesGeraisUnidadeEducacionalProps = {
  readonly tiposUnidades: SelectOption[];
  readonly diretoriasRegionais: SelectOption[];
  readonly subprefeituras: SelectOption[];
readonly "data-testid"?: string;
};


export function InformacoesGeraisUnidadeEducacional({
    tiposUnidades, diretoriasRegionais, subprefeituras, "data-testid": testId,
}: InformacoesGeraisUnidadeEducacionalProps) {
  return (
    <div className="space-y-8" data-testid={testId}>
        <FormSection
                title="Informações da UE"
                description="Dados de identificação da Unidade Educacional"
            > 
            <div className="grid grid-cols-2 gap-4">
                <FormTextField
                    name="codigo_eol"
                    label="CODESC (Código EOL)"
                    disabled
                />
                 <FormSelectField
                    name="tipo_escola"
                    label="Tipo de escola"
                    options={tiposUnidades}
                    disabled
                />
                 <FormSelectField
                    name="diretoria_regional"
                    label="Diretoria Regional de Educação (DRE)"
                    options={diretoriasRegionais}
                    disabled
                />
                 <FormTextField
                    name="nome"
                    label="Unidade Educacional"
                    disabled
                />
            </div>
            <div className="grid grid-cols-4 gap-4">
                <FormSelectField
                    name="subprefeitura"
                    label="Subprefeitura"
                    options={subprefeituras}
                    disabled
                />
                 <FormTextField
                    name="lote"
                    label="Lote"
                    disabled
                />
                 <FormSelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPCOES}
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
            <div className="grid grid-cols-[401px_1fr] gap-4">
                <FormMaskedField
                    name="cep"
                    label="CEP"
                    mask={maskCep}
                    unmask={unmaskCep}
                    disabled
                />
                 <FormTextField
                    name="logradouro"
                    label="Logradouro"
                    disabled
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <FormTextField
                    name="numero"
                    label="Número"
                    disabled
                />
                <FormTextField
                    name="bairro"
                    label="Bairro"
                    disabled
                />
                <FormTextField
                    name="cidade"
                    label="Cidade"
                    disabled
                />
                <FormSelectField
                    name="estado"
                    label="Estado"
                    options={ESTADOS}
                    disabled
                />
            </div>
        </FormSection>
    </div>
  );
}

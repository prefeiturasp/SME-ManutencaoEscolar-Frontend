"use client";

import {
    FormMaskedField,
    FormSection,
    FormTextField
} from "@/components/form";
import { maskCep, maskTelefone, unmaskCep, unmaskTelefone } from "@/utils/formatadores";

export function InformacoesGeraisUnidadeEducacional() {
  return (
    <div className="space-y-8">
        <FormSection
                title="Informações da UE"
                description="Dados de identificação da Unidade Educacional"
            > 
            <div className="grid grid-cols-4 gap-4">
                <FormTextField
                    name="codigo_eol"
                    label="CODESC (Código EOL)"
                />
                 <FormTextField
                    name="tipo_escola.sigla"
                    label="Tipo de escola"
                />
                 <FormTextField
                    name="diretoria_regional.nome_curto"
                    label="Diretoria Regional de Educação (DRE)"
                />
                 <FormTextField
                    name="nome"
                    label="Unidade Educacional"
                />
                <FormTextField
                    name="subprefeitura.nome"
                    label="Subprefeitura"
                />
                 <FormTextField
                    name="lote.nome"
                    label="Lote"
                />
                 <FormTextField
                    name="status"
                    label="Status"
                />
                 <FormMaskedField
                    name="dados.telefone"
                    label="Telefone fixo"
                    mask={maskTelefone}
                    unmask={unmaskTelefone}
                />
            </div>
             <div className="grid grid-cols-1 gap-1">
                <FormTextField
                    name="dados.email"
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
                    name="dados.cep"
                    label="CEP"
                    mask={maskCep}
                    unmask={unmaskCep}
                />
                 <FormTextField
                    name="dados.logradouro"
                    label="Logradouro"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                 <FormTextField
                    name="dados.numero"
                    label="Número"
                />
                <FormTextField
                    name="dados.bairro"
                    label="Bairro"
                />
                <FormTextField
                    name="dados.municipio"
                    label="Cidade"
                />
                <FormTextField
                    name="dados.uf"
                    label="Estado"
                />
            </div>
        </FormSection>
    </div>
  );
}

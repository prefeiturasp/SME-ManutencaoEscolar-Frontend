import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";

import type { DuplicidadeProfissional } from "../../types/profissional.types";

export const TITULO_CADASTRO_DUPLICADO = "Não é possível cadastrar o profissional";
export const TITULO_EDICAO_DUPLICADA = "Não é possível editar o profissional";

const ORIENTACAO = "Verifique os dados informados ou consulte o cadastro existente antes de continuar.";

export function obterMensagemDuplicidade({ cpf, rg }: DuplicidadeProfissional): string {
  if (cpf && rg) {
    return "Já existe um profissional cadastrado com o CPF e o RG informados. Verifique os dados ou consulte o cadastro existente antes de continuar.";
  }
  return `Já existe um profissional cadastrado com este ${cpf ? "CPF" : "RG"}. ${ORIENTACAO}`;
}

type AlertaErroProfissionalDuplicadoProps = Readonly<{
  duplicidade: DuplicidadeProfissional | null;
  modoEdicao?: boolean;
  onOpenChange: (aberto: boolean) => void;
}>;

export function AlertaErroProfissionalDuplicado({
  duplicidade,
  modoEdicao = false,
  onOpenChange,
}: AlertaErroProfissionalDuplicadoProps) {
  return (
    <AlertaErro
      aberto={duplicidade !== null}
      titulo={modoEdicao ? TITULO_EDICAO_DUPLICADA : TITULO_CADASTRO_DUPLICADO}
      mensagem={duplicidade ? obterMensagemDuplicidade(duplicidade) : ""}
      onOpenChange={onOpenChange}
    />
  );
}

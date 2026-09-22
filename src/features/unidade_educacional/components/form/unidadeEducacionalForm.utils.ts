import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";
import { AtualizarUnidadeEducacionalPayload } from "../../types/unidadesEducacionais.types";

type ResponsavelFormulario =
  Partial<UnidadeEducacionalSchema["responsaveis"][number]>;

type ValoresFormulario = Partial<
  Omit<UnidadeEducacionalSchema, "responsaveis">
> & {
  responsaveis?: ResponsavelFormulario[];
};

export function camposEstaoPreenchidos(
  valores: ValoresFormulario,
  campos: readonly (keyof UnidadeEducacionalSchema)[],
): boolean {
  if (campos.length === 0) {
    return false;
  }

  return campos.every((campo) => {
    const valor = valores[campo];

    if (campo === "responsaveis") {
      const responsaveis = valores.responsaveis;

      if (!responsaveis || responsaveis.length === 0) {
        return false;
      }

      return responsaveis.every((responsavel) =>
        [
          responsavel.registro_funcional,
          responsavel.nome,
          responsavel.cargo,
          responsavel.email,
        ].every(
          (campoResponsavel) =>
            typeof campoResponsavel === "string" &&
            campoResponsavel.trim() !== "",
        ),
      );
    }

    return typeof valor === "string" && valor.trim() !== "";
  });
}

export function montarPayloadAtualizacao(
  dados: UnidadeEducacionalSchema,
): AtualizarUnidadeEducacionalPayload {
  return {
    email: dados.email,
    telefone:dados.telefone,
    status: dados.status,
    responsaveis: dados.responsaveis.map((responsavel) => {
      if (responsavel.responsavelExistente) {
        return {
          email: responsavel.email,
          telefone: responsavel.telefone,
          celular: responsavel.celular,
        };
      }

      return {
        registro_funcional: responsavel.registro_funcional,
        nome: responsavel.nome,
        cargo: responsavel.cargo,
        email: responsavel.email,
        telefone: responsavel.telefone,
        celular: responsavel.celular,
      };
    }),
  };
}
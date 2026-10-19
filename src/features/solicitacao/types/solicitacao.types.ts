import type { SolicitacaoFormData } from "../schemas/solicitacaoSchema";

export type CriarSolicitacaoParams = {
  dados: SolicitacaoFormData;
  enviar?: boolean;
};

export type CriarSolicitacaoResultado =
  | { success: true }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

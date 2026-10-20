import type { SolicitacaoFormData } from "../schemas/solicitacaoSchema";
import type { ServicoManutencao } from "../schemas/adicionarServicoSchema";

export type CriarSolicitacaoParams = Omit<SolicitacaoFormData, "servicos"> & {
  servicos: (Omit<ServicoManutencao, "id" | "arquivos"> & {
    arquivos: { arquivo: [File] }[];
  })[];
  enviar?: boolean;
};

export type SolicitacaoCriada = {
  codigo: string | number;
};

export type CriarSolicitacaoResultado =
  | { success: true; codigo: SolicitacaoCriada["codigo"] }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type DecisaoDre = "aprovada" | "reprovada" | "necessidade_revisao";

export type EnviarSolicitacaoGmeSmeParams = {
  uuid: string;
  decisao: DecisaoDre;
  observacoes: string;
  data_alteracao: string;
};

export type AnaliseDreResposta = {
  dados: {
    uuid: string;
    perfil: string;
    decisao: DecisaoDre;
    observacoes: string;
    data_alteracao: string | null;
  };
  detail: string;
};

export type EnviarSolicitacaoGmeSmeResultado =
  | { success: true; data: AnaliseDreResposta }
  | { success: false; error: "api-error"; title: string; message: string; status?: number };

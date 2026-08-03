export type ServiceFormData = {
  id: number;
  uuid: string;
  nome: string;
  status: boolean;
};

export type CriarServicoResultado =
  | {
      success: true;
      service: ServiceFormData;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type Servico = {
  id: number;
  uuid: string;
  nome: string;
  status: boolean;
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaServicos = RespostaPaginada<Servico>;

export type FiltrosServico = {
  nome?: string;
  status?: boolean;
  page?: number;
  page_size?: number;
};

export type StatusFiltro = "" | "ativo" | "inativo";

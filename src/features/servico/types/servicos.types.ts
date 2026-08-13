import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
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

export type FiltrosServicoProps = {
  nome: string;
  status: StatusFiltro;
  onMudarNome: (nome: string) => void;
  onMudarStatus: (status: StatusFiltro) => void;
  onBuscar: () => void;
  onLimpar: () => void;
  servicos: Servico[];
};

export type CriarColunasServicoParams = {
  onEditar: (servico: Servico) => void;
};

export type TabelaServicoProps = {
  servicos: Servico[];
  colunas: ColunaTabela<Servico>[];
  atualizando?: boolean;
};

export type Servico = {
  id?: number;
  uuid?: string;
  nome?: string;
  status: boolean | undefined;
  criado_por?: number | null;
  username?: string;
  criado_por_nome?: string | null;
  criado_em?: string;
  atualizado_por?: number | null;
  atualizado_por_nome?: string | null;
  atualizado_em?: string;
};

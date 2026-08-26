import type { FiltroListaValues } from "@/components/shared/FiltroLista/types/FiltroLista.type";
import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
export type CriarColunasUnidadeEducacionalParams = {
  onEditar: (unidadeEducacional: UnidadeEducacional) => void;
};

export type UnidadeEducacional = {
  id: number;
  uuid?: string;
  codigo_eol?: string;
  nome?: string;
  diretoria_regional?: {
    id: number;
    codigo: string;
    nome: string;
    abreviacao: string;
    nome_curto: string;
  };
  tipo_escola?: {
    id: number;
    uuid: string;
    codigo_eol: number;
    sigla: string;
  };
  subprefeitura?: {
    id: number;
    uuid: string;
    codigo_eol: string;
    nome: string;
  };
  lote?: {
    id: number;
    uuid: string;
    codigo: string;
    nome: string;
  } | null;
  status: boolean | undefined;
};

export type TabelaUnidadesEducacionaisProps = {
  unidades: UnidadeEducacional[];
  colunas: ColunaTabela<UnidadeEducacional>[];
  atualizando?: boolean;
};

export type UnidadeEducacionalListParams = {
  codigo_eol?: string;
  tipo_escola?: string;
  diretoria_regional?: string;
  unidade_educacional?: string;
  subprefeitura?: string;
  lote?: string;
  status?: string;
  page?: number;
  page_size?: string;
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaUnidadeEducacional = RespostaPaginada<UnidadeEducacional>;

export type StatusFiltro = "" | "ativo" | "inativo";

export type FiltrosUnidadeEducacionalValues = FiltroListaValues;

export type FiltrosUnidadeEducacionalProps = {
  values: FiltrosUnidadeEducacionalValues;
  onChange: (name: string, value: string) => void;
  onBuscar: () => void;
  onLimpar: () => void;
};

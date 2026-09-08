import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import { DiretoriaRegional } from "@/features/diretoria_regional/types/diretoriasRegionais.types";
import { Empresa } from "@/features/empresa/types/empresa.types";

export type LoteCriado = {
  id: number;
  uuid: string;
  codigo_cadastro: string;
  nome: string;
  status: boolean;
  periodo_inicial: string;
  periodo_final: string;
};

export type DreVinculada = [dre: string, lote: string];

export type CriarLoteResultado =
  | {
      success: true;
      lote: LoteCriado;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      vinculados?: DreVinculada[];
      status?: number;
    };

export type DetalheErro = {
  message?: string;
  vinculados?: DreVinculada[];
};

export type ErroApi = {
  title?: string;
  detail?: string | DetalheErro;
  message?: string;
  codigo_cadastro: string[];
  nome?: string[];
  empresa?: string[];
  periodo_inicial?: string[];
  periodo_final?: string[];
  diretorias_regionais?: string[];
  non_field_errors?: string[];
};

export type LoteListParams = {
  codigo_cadastro?: string;
  nome?: string;
  status?: boolean;
  empresa?: number;
  diretorias_regionais?: string;
  periodo_inicial?: string;
  periodo_final?: string;
  page: number;
  page_size?: number;
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaLotes = RespostaPaginada<Lote>;

export type Lote = {
  id: number;
  uuid?: string;
  codigo_cadastro: string;
  nome?: string;
  status: boolean | undefined;
  empresa?: Empresa;
  periodo_inicial?: string | null;
  periodo_final?: string | null;
  diretorias_regionais?: DiretoriaRegional[];
  criado_por?: number | null;
  criado_por_nome?: string | null;
  criado_em: string;
  atualizado_por?: number | null;
  atualizado_por_nome?: string | null;
  username?: string;
  atualizado_em: string;
};

export type TabelaLoteProps = {
  lotes: Lote[];
  colunas: ColunaTabela<Lote>[];
  atualizando?: boolean;
};

export type CriarColunasLoteParams = {
  onEditar: (lote: Lote) => void;
};

export type OpcaoFiltroLote = {
  label: string;
  value: string;
};

export type FiltroLoteValues = {
  codigo_cadastro: string;
  nome: string;
  status: string;
  empresa: string;
  diretorias_regionais: string[];
  periodo_inicial: string;
  periodo_final: string;
};

export type StatusFiltroLote = "" | "ativo" | "inativo";

import type { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";
import type { EquipeFormData, ProfissionalEquipeFormData } from "../schema/equipeSchema";

export type ProfissionalEquipe = ProfissionalEquipeFormData;

export type EquipePayload = Omit<EquipeFormData, "situacao"> & {
  status: boolean;
};

export type EquipeCriada = EquipePayload & {
  id: number;
  uuid: string;
};

export type Equipe = EquipeCriada & {
  criado_por?: number | null;
  criado_por_nome?: string | null;
  criado_em?: string;
  atualizado_por?: number | null;
  atualizado_por_nome?: string | null;
  atualizado_em?: string;
};

export type CriarEquipeResultado =
  | {
      success: true;
      equipe: EquipeCriada;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type DetalheErro = {
  message?: string;
};

export type ErroProfissionalEquipe = {
  profissional?: string[];
  funcao?: string[];
  non_field_errors?: string[];
};

export type ErroApi = {
  title?: string;
  detail?: string | DetalheErro;
  message?: string;
  nome?: string[];
  status?: string[];
  situacao?: string[];
  empresa?: string[];
  lote?: string[];
  profissionais?: string[] | ErroProfissionalEquipe[];
  non_field_errors?: string[];
};

export type EquipeListParams = {
  nome?: string;
  status?: boolean;
  empresa?: string;
  lote?: string;
  page: number;
  page_size?: number | "all";
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaEquipes = RespostaPaginada<Equipe>;

export type TabelaEquipeProps = {
  equipes: Equipe[];
  colunas: ColunaTabela<Equipe>[];
  atualizando?: boolean;
};

export type CriarColunasEquipeParams = {
  onEditar: (equipe: Equipe) => void;
};

export type OpcaoFiltroEquipe = {
  label: string;
  value: string;
};

export type FiltroEquipeValues = {
  nome: string;
  status: string;
  empresa: string;
  lote: string;
};

export type StatusFiltroEquipe = "" | "ativo" | "inativo";

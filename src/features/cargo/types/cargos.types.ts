import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";

export type DocumentoCargoCriado = {
  nome: string;
};

export type CargoCriado = {
  nome: string;
  exige_documento: boolean;
  status: boolean;
  documentos: DocumentoCargoCriado[];
};

export type CriarCargoResultado =
  | {
      success: true;
      cargo: CargoCriado;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type DetalheErroCargo = {
  message?: string;
};

export type ErroDocumentoCargo = {
  nome?: string[];
};

export type ErroApiCargo = {
  title?: string;
  detail?: string | DetalheErroCargo;
  message?: string;
  nome?: string[];
  exige_documento?: string[];
  status?: string[];
  documentos?: string[] | ErroDocumentoCargo[];
  non_field_errors?: string[];
};

export type DocumentoCargo = {
  id: number;
  uuid?: string;
  nome: string;
  criado_por?: number | null;
  criado_em?: string;
  atualizado_por?: number | null;
  atualizado_em?: string;
};

export type Cargo = {
  id: number;
  uuid?: string;
  nome: string;
  exige_documento: boolean;
  status: boolean;
  documentos: DocumentoCargo[];
  criado_por?: number | null;
  criado_por_nome?: string | null;
  criado_em: string;
  atualizado_por?: number | null;
  atualizado_por_nome?: string | null;
  username?: string;
  atualizado_em: string;
};

export type CargoListParams = {
  nome?: string;
  status?: boolean;
  exige_documento?: boolean;
  page: number;
  page_size?: number;
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaCargos = RespostaPaginada<Cargo>;

export type TabelaCargoProps = {
  cargos: Cargo[];
  colunas: ColunaTabela<Cargo>[];
  atualizando?: boolean;
};

export type CriarColunasCargoParams = {
  onEditar: (cargo: Cargo) => void;
};

export type OpcaoFiltroCargo = {
  label: string;
  value: string;
};

export type FiltroCargoValues = {
  nome: string;
  status: string;
  exige_documento: string;
};

export type StatusFiltroCargo = "" | "ativo" | "inativo";

export type ExigeDocumentoFiltroCargo = "" | "sim" | "nao";

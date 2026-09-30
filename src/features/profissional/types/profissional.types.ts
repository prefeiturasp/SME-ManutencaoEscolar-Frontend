import type { ProfissionalSchemaOutput } from "../schemas/profissional.schema";

export type ProfissionalFormValues = ProfissionalSchemaOutput;

export type Profissional = Omit<ProfissionalFormValues, "funcoes"> & {
  uuid: string;
  funcoes: string[];
};

export type DocumentoFuncaoProfissional = {
  uuid: string;
  nome_original: string;
  arquivo: string;
  tipo: string;
  tipo_mime: string;
  tamanho_bytes: number;
};

export type FuncaoProfissional = {
  uuid: string;
  nome_cargo: string;
  uuid_cargo: string;
  documentos: DocumentoFuncaoProfissional[];
  criado_por?: string | null;
  registro_funcional?: string | null;
  criado_em?: string | null;
};

export type ProfissionalDetalhe = Omit<Profissional, "funcoes"> & {
  criado_por: string;
  criado_em: string;
  atualizado_por?: string | null;
  atualizado_em?: string | null;
  registro_funcional_criador?: string | null;
  registro_funcional_editor?: string | null;
  funcoes: FuncaoProfissional[];
};

export type ProfissionalResultado =
  | { success: true; profissional: ProfissionalDetalhe }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
      fieldErrors?: { cpf?: string; rg?: string };
    };

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaProfissionais = RespostaPaginada<Profissional>;

export type CriarColunasProfissionalParams = {
  onEditar: (profissional: Profissional) => void;
};

export type ProfissionalFiltrosValues = {
  nome: string;
  rg: string;
  cpf: string;
  funcao: string;
  status: string;
};

export type ProfissionalListParams = {
  nome?: string;
  rg?: string;
  cpf?: string;
  funcao?: string;
  status?: string;
  page?: number;
  page_size?: number | "all";
};

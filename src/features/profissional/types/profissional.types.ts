import type { ProfissionalSchemaOutput } from "../schemas/profissional.schema";

export type ProfissionalFormValues = ProfissionalSchemaOutput;

export type Profissional = Omit<ProfissionalFormValues, "funcoes"> & {
  uuid: string;
  funcoes: string[];
};

export type ProfissionalResultado =
  | { success: true; profissional: Profissional }
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

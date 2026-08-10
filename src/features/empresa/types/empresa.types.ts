import { ESTADOS_VALUES } from "@/constants/constants";
import type { EmpresaSchemaOutput } from "../schemas/empresa.schema";
import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";

export type Empresa = {
  id: number;
  uuid: string;
  nome: string;
  cnpj: string;
  status: boolean;
  razao_social: string;
  link_rastreio?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  estado: (typeof ESTADOS_VALUES)[number];
};

export type EmpresaFormValues = EmpresaSchemaOutput;

export type EmpresaListParams = {
  nome?: string;
  razao_social?: string;
  cnpj?: string;
  status?: string;
  page?: number;
  page_size?: number;
};

export type RespostaPaginada<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type RespostaEmpresas = RespostaPaginada<Empresa>;

export type CriarColunasEmpresaParams = {
  onEditar: (empresa: Empresa) => void;
};

export type TabelaEmpresaProps = {
  empresas: Empresa[];
  colunas: ColunaTabela<Empresa>[];
  atualizando?: boolean;
};

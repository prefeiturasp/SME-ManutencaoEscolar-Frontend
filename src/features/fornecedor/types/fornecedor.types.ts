import { ESTADOS_VALUES } from "@/constants";
import type { FornecedorSchemaOutput } from "../schemas/fornecedor.schema";
import { ColunaTabela } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";

export type Fornecedor = {
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

export type FornecedorFormValues = FornecedorSchemaOutput;

export type FornecedorListParams = {
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

export type RespostaFornecedores = RespostaPaginada<Fornecedor>;

export type CriarColunasFornecedorParams = {
  onEditar: (fornecedor: Fornecedor) => void;
};

export type TabelaFornecedorProps = {
  fornecedores: Fornecedor[];
  colunas: ColunaTabela<Fornecedor>[];
  atualizando?: boolean;
};

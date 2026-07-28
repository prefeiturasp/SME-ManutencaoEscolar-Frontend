import { ESTADOS_VALUES } from "@/constants";
import type { FornecedorSchemaOutput } from "../schemas/fornecedor.schema";

export type Fornecedor = {
  id: string;
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

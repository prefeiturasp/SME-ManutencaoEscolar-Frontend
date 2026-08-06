import { api } from "@/actions/http/client";
import type {
  Fornecedor,
  FornecedorFormValues,
  FornecedorListParams,
  RespostaFornecedores,
} from "../types/fornecedor.types";

export const fornecedorService = {
  async create(payload: FornecedorFormValues): Promise<Fornecedor> {
    const { data } = await api.post<Fornecedor>("/fornecedores", payload);
    return data;
  },

  async list(params: FornecedorListParams): Promise<RespostaFornecedores> {
    const { data } = await api.get<RespostaFornecedores>("/fornecedores", {
      params,
    });
    return data;
  },
};

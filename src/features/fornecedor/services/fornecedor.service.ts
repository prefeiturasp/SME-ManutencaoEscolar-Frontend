import type {
  Fornecedor,
  FornecedorFormValues,
} from "../types/fornecedorTypes";
import { api } from "@/actions/http/client";

export const fornecedorService = {
  async create(payload: FornecedorFormValues): Promise<Fornecedor> {
    const { data } = await api.post<Fornecedor>("/fornecedores", payload);
    return data;
  },
};

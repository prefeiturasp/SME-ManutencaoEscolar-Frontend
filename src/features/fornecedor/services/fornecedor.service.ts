import { api } from "@/actions/http/client";
import type {
  Fornecedor,
  FornecedorFormValues,
} from "../types/fornecedor.types";

export const fornecedorService = {
  async create(payload: FornecedorFormValues): Promise<Fornecedor> {
    const { data } = await api.post<Fornecedor>("/fornecedores", payload);
    return data;
  },
};

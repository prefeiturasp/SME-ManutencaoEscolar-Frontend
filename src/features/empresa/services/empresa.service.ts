import { api } from "@/actions/http/client";
import type {
  Empresa,
  EmpresaFormValues,
  EmpresaListParams,
  RespostaEmpresas,
} from "../types/empresa.types";

export const empresaService = {
  async create(payload: EmpresaFormValues): Promise<Empresa> {
    const { data } = await api.post<Empresa>("/empresas", payload);
    return data;
  },

  async list(params: EmpresaListParams): Promise<RespostaEmpresas> {
    const { data } = await api.get<RespostaEmpresas>("/empresas", {
      params,
    });
    return data;
  },
};

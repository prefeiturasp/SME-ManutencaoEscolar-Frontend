"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarProfissional } from "../services/profissional.service";
import type { ProfissionalFormValues } from "../types/profissional.types";

export class ProfissionalApiError extends Error {
  constructor(
    descricao: string,
    public readonly fieldErrors: { cpf?: string; rg?: string } = {},
  ) {
    super(descricao);
    this.name = "ProfissionalApiError";
  }
}

export function useCreateProfissional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfissionalFormValues) => {
      const resultado = await criarProfissional(payload);
      if (!resultado.success)
        throw new ProfissionalApiError(resultado.message, resultado.fieldErrors);
      return resultado;
    },
    meta: {
      loading: { titulo: "Aguarde um momento!", mensagem: "Estamos cadastrando o profissional..." },
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissionais"] });
    },
  });
}

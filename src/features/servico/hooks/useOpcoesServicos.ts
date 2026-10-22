"use client";

import { useQuery } from "@tanstack/react-query";

import { listarServicosAction } from "../services/buscar.api";

export function useOpcoesServicos() {
  return useQuery({
    queryKey: ["servicos", "opcoes", "ativos"],
    queryFn: async () => {
      const opcoes: { value: string; label: string }[] = [];
      let page = 1;

      while (true) {
        const resposta = await listarServicosAction({ status: true, page, page_size: 100 });
        for (const servico of resposta.results) {
          if (servico.uuid && servico.nome && servico.status === true) {
            opcoes.push({ value: servico.uuid, label: servico.nome });
          }
        }
        if (!resposta.next) break;
        page += 1;
      }

      return opcoes;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

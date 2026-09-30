"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { CargoEol, RespostaCargoEOL } from "../types/cargosEol.types";

export async function listarTodosCargosEolAction(): Promise<CargoEol[]> {
  const resposta = await requisicaoAutenticada<RespostaCargoEOL>({
    method: "GET",
    url: "/cargos-eol/",
    params: { page_size: "all" },
  });

  return resposta.results;
}

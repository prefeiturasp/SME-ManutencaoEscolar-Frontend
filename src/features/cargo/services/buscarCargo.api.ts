"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { Cargo, FiltrosCargos, RespostaCargos } from "../types/cargos.types";

export async function listarCargosAction(
  filtros?: FiltrosCargos,
): Promise<RespostaCargos> {
  return requisicaoAutenticada<RespostaCargos>({
    method: "GET",
    url: "/cargos/",
    params: filtros,
  });
}

export async function buscarCargoAction(uuid: string): Promise<Cargo> {
  return requisicaoAutenticada<Cargo>({
    method: "GET",
    url: `/cargos/${uuid}/`,
  });
}

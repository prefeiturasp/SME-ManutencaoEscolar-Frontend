"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { CargoEol } from "../types/cargosEol.types";

export async function listarTodosCargosEolAction(): Promise<CargoEol[]> {
  return requisicaoAutenticada<CargoEol[]>({
    method: "GET",
    url: "/cargos-eol/",
    params: { page_size: "all" },
  });
}

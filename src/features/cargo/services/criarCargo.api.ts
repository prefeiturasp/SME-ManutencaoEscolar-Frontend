"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { CargoFormData } from "@/features/cargo/schemas/cargoSchema";
import type {
  CargoCriado,
  CriarCargoResultado,
} from "@/features/cargo/types/cargos.types";

import { obterResultadoErroCargo } from "./obterResultadoErroCargo";

export async function criarCargo(
  dados: CargoFormData,
): Promise<CriarCargoResultado> {
  try {
    const cargo = await requisicaoAutenticada<CargoCriado>({
      method: "POST",
      url: "/cargos/",
      data: dados,
    });

    return {
      success: true,
      cargo,
    };
  } catch (error) {
    return obterResultadoErroCargo(error);
  }
}

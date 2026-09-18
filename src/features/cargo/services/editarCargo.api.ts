"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { CargoFormData } from "../schemas/CargoSchema";
import { CargoCriado, CriarCargoResultado } from "../types/cargos.types";
import { obterResultadoErroCargo } from "./obterResultadoErroCargo";

type EditarCargoCredenciais = {
  uuid: string;
  dados: CargoFormData;
};

export async function editarCargoAction({
  uuid,
  dados,
}: EditarCargoCredenciais): Promise<CriarCargoResultado> {
  try {
    const cargo = await requisicaoAutenticada<CargoCriado>({
      method: "PATCH",
      url: `/cargos/${uuid}/`,
      data: {
        ...dados,
      },
    });

    return {
      success: true,
      cargo,
    };
  } catch (error) {
    return obterResultadoErroCargo(error);
  }
}

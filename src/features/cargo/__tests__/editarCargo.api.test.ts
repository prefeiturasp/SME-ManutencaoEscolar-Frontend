import { beforeEach, describe, expect, it, vi } from "vitest";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";

import type { CargoFormData } from "../schemas/cargoSchema";

import type { CargoCriado, CriarCargoResultado } from "../types/cargos.types";

import { editarCargoAction } from "../services/editarCargo.api";

import { obterResultadoErroCargo } from "../services/obterResultadoErroCargo";

const mocks = vi.hoisted(() => ({
  requisicaoAutenticada: vi.fn(),
  obterResultadoErroCargo: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: mocks.requisicaoAutenticada,
}));

vi.mock("../services/obterResultadoErroCargo", () => ({
  obterResultadoErroCargo: mocks.obterResultadoErroCargo,
}));

describe("editarCargoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia uma requisição PATCH com o UUID e os dados do cargo", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    const dados: CargoFormData = {
      nome: "Engenheiro Eletricista",
      exige_documento: "true",
      novo_documento: "",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    const cargo = {
      id: 1,
      uuid,
      nome: "Engenheiro Eletricista",
      exige_documento: true,
      status: true,
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    } as CargoCriado;

    mocks.requisicaoAutenticada.mockResolvedValueOnce(cargo);

    const resultado = await editarCargoAction({
      uuid,
      dados,
    });

    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "PATCH",
      url: `/cargos/${uuid}/`,
      data: {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        novo_documento: "",
        documentos: [
          {
            nome: "Certificado NR-10",
          },
        ],
      },
    });

    expect(resultado).toEqual({
      success: true,
      cargo,
    });

    expect(obterResultadoErroCargo).not.toHaveBeenCalled();
  });

  it("permite atualizar um cargo que não exige documentos", async () => {
    const uuid = "uuid-cargo-sem-documentos";

    const dados: CargoFormData = {
      nome: "Auxiliar Administrativo",
      exige_documento: "false",
      novo_documento: "",
      documentos: [],
    };

    const cargo = {
      id: 2,
      uuid,
      nome: "Auxiliar Administrativo",
      exige_documento: false,
      status: true,
      documentos: [],
    } as CargoCriado;

    mocks.requisicaoAutenticada.mockResolvedValueOnce(cargo);

    const resultado = await editarCargoAction({
      uuid,
      dados,
    });

    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "PATCH",
      url: "/cargos/uuid-cargo-sem-documentos/",
      data: {
        nome: "Auxiliar Administrativo",
        exige_documento: "false",
        novo_documento: "",
        documentos: [],
      },
    });

    expect(resultado).toEqual({
      success: true,
      cargo,
    });
  });

  it("converte o erro da requisição para o resultado esperado", async () => {
    const uuid = "a6421bd7-a6e5-4883-a7c7-43cff161618a";

    const dados: CargoFormData = {
      nome: "Cargo duplicado",
      exige_documento: "false",
      novo_documento: "",
      documentos: [],
    };

    const erroOriginal = {
      response: {
        status: 400,
        data: {
          title: "Cargo já cadastrado",
          detail: {
            message: "Já existe um cargo com o nome informado.",
          },
        },
      },
    };

    const resultadoErro: CriarCargoResultado = {
      success: false,
      error: "api-error",
      status: 400,
      title: "Cargo já cadastrado",
      message: "Já existe um cargo com o nome informado.",
    };

    mocks.requisicaoAutenticada.mockRejectedValueOnce(erroOriginal);

    mocks.obterResultadoErroCargo.mockReturnValueOnce(resultadoErro);

    const resultado = await editarCargoAction({
      uuid,
      dados,
    });

    expect(requisicaoAutenticada).toHaveBeenCalledExactlyOnceWith({
      method: "PATCH",
      url: `/cargos/${uuid}/`,
      data: {
        nome: "Cargo duplicado",
        exige_documento: "false",
        novo_documento: "",
        documentos: [],
      },
    });

    expect(obterResultadoErroCargo).toHaveBeenCalledExactlyOnceWith(
      erroOriginal,
    );

    expect(resultado).toEqual(resultadoErro);
  });

  it("trata erros inesperados lançados pela requisição", async () => {
    const dados: CargoFormData = {
      nome: "Eletricista",
      exige_documento: "true",
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    const erroOriginal = new Error("Falha inesperada na requisição");

    const resultadoErro: CriarCargoResultado = {
      success: false,
      error: "api-error",
      status: 500,
      title: "Erro",
      message:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    };

    mocks.requisicaoAutenticada.mockRejectedValueOnce(erroOriginal);

    mocks.obterResultadoErroCargo.mockReturnValueOnce(resultadoErro);

    const resultado = await editarCargoAction({
      uuid: "uuid-cargo",
      dados,
    });

    expect(obterResultadoErroCargo).toHaveBeenCalledExactlyOnceWith(
      erroOriginal,
    );

    expect(resultado).toEqual(resultadoErro);
  });
});

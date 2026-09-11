import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CargoFormData } from "@/features/cargo/schemas/cargoSchema";

const { obterResultadoErroCargoMock, requisicaoAutenticadaMock } = vi.hoisted(
  () => ({
    obterResultadoErroCargoMock: vi.fn(),
    requisicaoAutenticadaMock: vi.fn(),
  }),
);

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

vi.mock("../services/obterResultadoErroCargo", () => ({
  obterResultadoErroCargo: obterResultadoErroCargoMock,
}));

import { criarCargo } from "../services/criarCargo.api";

describe("criarCargo", () => {
  const dados: CargoFormData = {
    nome: "Eletricista",
    exige_documento: "true",
    novo_documento: "",
    documentos: [
      {
        nome: "Certificado NR-10",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia a requisição POST e retorna o cargo criado", async () => {
    const cargoCriado = {
      id: 1,
      uuid: "cargo-uuid-1",
      nome: "Eletricista",
      exige_documento: true,
      status: true,
      documentos: [
        {
          nome: "Certificado NR-10",
        },
      ],
    };

    requisicaoAutenticadaMock.mockResolvedValue(cargoCriado);

    const resultado = await criarCargo(dados);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledOnce();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "POST",
      url: "/cargos/",
      data: dados,
    });

    expect(resultado).toEqual({
      success: true,
      cargo: cargoCriado,
    });

    expect(obterResultadoErroCargoMock).not.toHaveBeenCalled();
  });

  it("delega o tratamento quando a requisição retorna erro da API", async () => {
    const erroApi = {
      response: {
        status: 400,
        data: {
          title: "Cargo já cadastrado",
          detail: {
            message: "Já existe um cargo com o nome Eletricista cadastrado.",
          },
        },
      },
    };

    const resultadoErro = {
      success: false,
      error: "api-error",
      title: "Cargo já cadastrado",
      message: "Já existe um cargo com o nome Eletricista cadastrado.",
      status: 400,
    };

    requisicaoAutenticadaMock.mockRejectedValue(erroApi);
    obterResultadoErroCargoMock.mockReturnValue(resultadoErro);

    const resultado = await criarCargo(dados);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledOnce();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "POST",
      url: "/cargos/",
      data: dados,
    });

    expect(obterResultadoErroCargoMock).toHaveBeenCalledOnce();

    expect(obterResultadoErroCargoMock).toHaveBeenCalledWith(erroApi);

    expect(resultado).toEqual(resultadoErro);
  });

  it("delega também o tratamento de erro inesperado", async () => {
    const erroInesperado = new Error("Falha de conexão");

    const resultadoErro = {
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Erro não identificado.",
      status: undefined,
    };

    requisicaoAutenticadaMock.mockRejectedValue(erroInesperado);
    obterResultadoErroCargoMock.mockReturnValue(resultadoErro);

    const resultado = await criarCargo(dados);

    expect(obterResultadoErroCargoMock).toHaveBeenCalledWith(erroInesperado);

    expect(resultado).toEqual(resultadoErro);
  });
});

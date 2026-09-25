import { describe, expect, it, vi } from "vitest";
import axios from "axios";

import { criarProfissional, listarProfissionais } from "../services/profissional.service";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

describe("criarProfissional", () => {
  it("envia funções e arquivos na estrutura esperada pela API", async () => {
    const arquivo = new File(["conteúdo"], "registro.pdf", { type: "application/pdf" });
    requisicaoAutenticadaMock.mockResolvedValue({ uuid: "profissional-uuid" });

    await criarProfissional({
      nome: "Bruno Salvador",
      rg: "973336703",
      cpf: "09867845603",
      status: true,
      funcoes: [
        {
          uuid_cargo: "cargo-uuid",
          documentos: [{ arquivo: [arquivo] }],
        },
      ],
    });

    const chamada = requisicaoAutenticadaMock.mock.calls[0][0];
    expect(chamada).toMatchObject({
      method: "POST",
      url: "/profissionais",
      headers: { "Content-Type": "multipart/form-data" },
    });
    expect(Array.from((chamada.data as FormData).entries())).toEqual([
      ["nome", "Bruno Salvador"],
      ["rg", "973336703"],
      ["cpf", "09867845603"],
      ["status", "true"],
      ["funcoes[0]uuid_cargo", "cargo-uuid"],
      ["funcoes[0]documentos[0]arquivo", arquivo],
    ]);
  });

  it("envia JSON quando a função não exige documentos", async () => {
    const payload = {
      nome: "Bruno Salvador",
      rg: "973336703",
      cpf: "09867845603",
      status: true,
      funcoes: [{ uuid_cargo: "cargo-uuid", documentos: [] }],
    };
    requisicaoAutenticadaMock.mockResolvedValue({ uuid: "profissional-uuid" });

    await criarProfissional(payload);

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "POST",
      url: "/profissionais",
      data: payload,
      headers: undefined,
    });
  });

  it("retorna o erro de validação da API com o status HTTP", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requisicaoAutenticadaMock.mockRejectedValueOnce(
      new axios.AxiosError("Requisição inválida", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: { title: "Dados inválidos", detail: "Confira o CPF." },
      }),
    );

    await expect(
      criarProfissional({
        nome: "João",
        rg: "1234567",
        cpf: "12345678901",
        status: true,
        funcoes: [],
      }),
    ).resolves.toMatchObject({ success: false, error: "api-error", status: 400 });
    expect(consoleError).toHaveBeenCalledWith("Erro da API ao cadastrar profissional:", {
      status: 400,
      resposta: { title: "Dados inválidos", detail: "Confira o CPF." },
    });
    consoleError.mockRestore();
  });

  it("preserva as mensagens de CPF e RG retornadas pela API", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requisicaoAutenticadaMock.mockRejectedValueOnce(
      new axios.AxiosError("Requisição inválida", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: { cpf: ["CPF já cadastrado."], rg: ["RG já cadastrado."] },
      }),
    );

    await expect(
      criarProfissional({
        nome: "João",
        rg: "1234567",
        cpf: "12345678901",
        status: true,
        funcoes: [],
      }),
    ).resolves.toMatchObject({
      success: false,
      fieldErrors: { cpf: "CPF já cadastrado.", rg: "RG já cadastrado." },
    });
    consoleError.mockRestore();
  });

  it.each([
    [undefined, {}],
    [null, {}],
    [["erro"], {}],
    [{ detail: { cpf: ["CPF inválido."], rg: "RG inválido." } }, { cpf: "CPF inválido.", rg: "RG inválido." }],
    [{ detail: null, cpf: "CPF inválido.", rg: " " }, { cpf: "CPF inválido." }],
    [{ detail: ["erro"], cpf: 123, rg: [] }, {}],
    [{ detail: "erro", cpf: [null], rg: "RG inválido." }, { rg: "RG inválido." }],
  ])("extrai apenas erros de campo válidos de %j", async (data, fieldErrors) => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requisicaoAutenticadaMock.mockRejectedValueOnce(
      new axios.AxiosError("Requisição inválida", "ERR_BAD_REQUEST", undefined, undefined, {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data,
      }),
    );

    await expect(
      criarProfissional({ nome: "João", rg: "1234567", cpf: "12345678901", status: true, funcoes: [] }),
    ).resolves.toMatchObject({ success: false, fieldErrors });
    consoleError.mockRestore();
  });

  it("propaga erros que não são respostas HTTP", async () => {
    const erro = new Error("Falha inesperada");
    requisicaoAutenticadaMock.mockRejectedValueOnce(erro);

    await expect(
      criarProfissional({
        nome: "João",
        rg: "1234567",
        cpf: "12345678901",
        status: true,
        funcoes: [],
      }),
    ).rejects.toBe(erro);
  });
});

describe("listarProfissionais", () => {
  it("encaminha os filtros para a API", async () => {
    const resposta = { count: 0, next: null, previous: null, results: [] };
    requisicaoAutenticadaMock.mockResolvedValueOnce(resposta);

    await expect(listarProfissionais({ nome: "João", page: 2 })).resolves.toBe(resposta);
    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/profissionais",
      params: { nome: "João", page: 2 },
    });
  });
});

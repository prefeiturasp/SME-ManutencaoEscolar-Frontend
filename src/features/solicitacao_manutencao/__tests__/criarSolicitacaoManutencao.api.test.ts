import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { CriarSolicitacaoManutencaoParams } from "../types/solicitacaoManutencao.types";
import { criarSolicitacaoManutencaoAction } from "../services/criarSolicitacaoManutencao.api";

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: vi.fn(),
}));

const requisicaoMock = vi.mocked(requisicaoAutenticada);

function criarDados(): CriarSolicitacaoManutencaoParams {
  return {
    unidade_educacional: "ue-uuid",
    tipo_atendimento: "comum",
    informacoes_adicionais: "Observação",
    servicos: [
      {
        servico: "servico-uuid",
        local_reparo: "Sala 1",
        descricao: "Reparar parede",
        arquivos: [{ arquivo: [new File(["imagem"], "foto.png", { type: "image/png" })] }],
      },
      {
        servico: "outros",
        servico_especifico: "Serralheria",
        local_reparo: "Portão",
        descricao: "Reparar portão",
        arquivos: [{ arquivo: [new File(["pdf"], "documento.pdf", { type: "application/pdf" })] }],
      },
    ],
  };
}

describe("criarSolicitacaoManutencaoAction", () => {
  it("usa valores padrão quando informações opcionais não são fornecidas", async () => {
    const dados = criarDados();
    delete dados.informacoes_adicionais;
    delete dados.servicos[1].servico_especifico;
    await criarSolicitacaoManutencaoAction(dados);
    const chamada = requisicaoMock.mock.calls[0][0];
    const payload = chamada.data as FormData;
    expect(chamada.url).toBe("/solicitacoes-manutencao/solicitacao-ue");
    expect(payload.get("informacoes_adicionais")).toBe("");
    expect(payload.get("servicos[1]servico_especifico")).toBe("");
    expect(payload.has("servicos[1]servico")).toBe(false);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    requisicaoMock.mockResolvedValue({ uuid: "solicitacao-uuid", codigo: "SOL-001" });
  });

  it.each([
    [false, "/solicitacoes-manutencao/solicitacao-ue"],
    [true, "/solicitacoes-manutencao/solicitacao-ue/?enviar=true"],
  ])("cria a solicitação com enviar=%s em uma única requisição", async (enviar, url) => {
    const dados = criarDados();
    expect(await criarSolicitacaoManutencaoAction({ ...dados, enviar })).toEqual({
      success: true,
      codigo: "SOL-001",
    });
    expect(requisicaoMock).toHaveBeenCalledTimes(1);
    expect(requisicaoMock).toHaveBeenCalledWith({
      method: "POST",
      url,
      data: expect.any(FormData),
      headers: { "Content-Type": "multipart/form-data" },
    });
    const payload = requisicaoMock.mock.calls[0][0].data as FormData;
    expect(Array.from(payload.keys())).toEqual([
      "unidade_educacional",
      "tipo_atendimento",
      "informacoes_adicionais",
      "servicos[0]servico",
      "servicos[0]local_reparo",
      "servicos[0]descricao",
      "servicos[0]arquivos[0]arquivo",
      "servicos[1]servico_especifico",
      "servicos[1]local_reparo",
      "servicos[1]descricao",
      "servicos[1]arquivos[0]arquivo",
    ]);
    expect(payload.get("servicos[0]servico")).toBe("servico-uuid");
    expect(payload.get("servicos[1]servico_especifico")).toBe("Serralheria");
    expect(payload.get("informacoes_adicionais")).toBe("Observação");
    const imagem = payload.get("servicos[0]arquivos[0]arquivo") as File;
    expect(imagem.name).toBe("foto.png");
    expect(imagem.size).toBe(dados.servicos[0].arquivos[0].arquivo[0].size);
  });

  it("retorna a mensagem de erro da API", async () => {
    const erro = new axios.AxiosError("Falha");
    Object.assign(erro, { response: { status: 400, data: { detail: "Unidade inválida." } } });
    requisicaoMock.mockRejectedValue(erro);

    expect(await criarSolicitacaoManutencaoAction(criarDados())).toEqual({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Unidade inválida.",
      status: 400,
    });
  });

  it("propaga erros inesperados para o tratamento da mutation", async () => {
    requisicaoMock.mockRejectedValue(new Error("Sessão expirada"));
    await expect(criarSolicitacaoManutencaoAction(criarDados())).rejects.toThrow("Sessão expirada");
  });
});

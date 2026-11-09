import { beforeEach, describe, expect, it, vi } from "vitest";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import {
  editarSolicitacaoManutencaoAction,
  editarEEnviarSolicitacaoManutencaoAction,
} from "../services/editarSolicitacaoManutencao.api";
import type { EditarSolicitacaoManutencaoParams } from "../types/solicitacaoManutencao.types";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
const requisicao = vi.mocked(requisicaoAutenticada);
function dados(): EditarSolicitacaoManutencaoParams {
  return {
    uuid: "s/1",
    unidade_educacional: "ue1",
    tipo_atendimento: "comum",
    servicos: [
      {
        uuid: "item1",
        servico: "pintura",
        local_reparo: "Sala",
        descricao: "Reparo",
        arquivos: [
          { uuid: "anexo1" },
          { arquivo: [new File(["foto"], "nova.jpg", { type: "image/jpeg" })] },
        ],
      },
      { servico: "outros", local_reparo: "Portão", descricao: "Serralheria", arquivos: [] },
    ],
  };
}

describe("editarSolicitacaoManutencaoAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requisicao.mockResolvedValue({ codigo: "00012" });
  });
  it.each([false, true])(
    "atualiza por PUT com anexos mantidos e novos, enviar=%s",
    async (enviar) => {
      const acao = enviar
        ? editarEEnviarSolicitacaoManutencaoAction
        : editarSolicitacaoManutencaoAction;
      expect(await acao(dados())).toEqual({
        success: true,
        codigo: "00012",
      });
      const chamada = requisicao.mock.calls[0][0];
      expect(chamada.method).toBe("PUT");
      expect(chamada.url).toBe(
        `/solicitacoes-manutencao/editar-solicitacao-ue/s%2F1/${enviar ? "?enviar=true" : ""}`,
      );
      expect(chamada.headers).toEqual({ "Content-Type": "multipart/form-data" });
      const payload = chamada.data as FormData;
      expect(payload.has("enviar")).toBe(false);
      expect(payload.get("unidade_educacional")).toBe("ue1");
      expect(payload.get("tipo_atendimento")).toBe("comum");
      expect(payload.get("informacoes_adicionais")).toBe("");
      expect(payload.get("servicos[0]uuid")).toBe("item1");
      expect(payload.get("servicos[0]servico")).toBe("pintura");
      expect(payload.get("servicos[0]servico_especifico")).toBe("");
      expect(payload.get("servicos[0]local_reparo")).toBe("Sala");
      expect(payload.get("servicos[0]descricao")).toBe("Reparo");
      expect(payload.get("servicos[0]arquivos[0]uuid")).toBe("anexo1");
      expect((payload.get("servicos[0]arquivos[1]arquivo") as File).name).toBe("nova.jpg");
      expect(payload.get("servicos[1]servico_especifico")).toBe("");
      expect(payload.get("servicos[1]servico")).toBe("");
      expect(payload.has("servicos[1]uuid")).toBe(false);
      expect(requisicao).toHaveBeenCalledTimes(1);
    },
  );
  it("usa salvar sem envio por padrão e preserva os textos informados", async () => {
    const parametros = dados();
    parametros.informacoes_adicionais = "Observação";
    parametros.servicos[1].servico_especifico = "Serralheria";
    await editarSolicitacaoManutencaoAction(parametros);
    expect(requisicao.mock.calls[0][0].url).toBe(
      "/solicitacoes-manutencao/editar-solicitacao-ue/s%2F1/",
    );
    const payload = requisicao.mock.calls[0][0].data as FormData;
    expect(payload.get("informacoes_adicionais")).toBe("Observação");
    expect(payload.get("servicos[1]servico_especifico")).toBe("Serralheria");
  });
  it("retorna erro da API e propaga falhas inesperadas", async () => {
    requisicao.mockRejectedValueOnce(
      Object.assign(new Error("Inválido"), {
        isAxiosError: true,
        response: { status: 400, data: { detail: "Dados inválidos." } },
      }),
    );
    expect(await editarSolicitacaoManutencaoAction(dados())).toEqual(
      expect.objectContaining({ success: false, error: "api-error", status: 400 }),
    );
    requisicao.mockRejectedValueOnce(new Error("Sem conexão"));
    await expect(editarSolicitacaoManutencaoAction(dados())).rejects.toThrow("Sem conexão");
  });
  it.each([editarSolicitacaoManutencaoAction, editarEEnviarSolicitacaoManutencaoAction])(
    "envia servico vazio quando existe serviço específico",
    async (acao) => {
      const parametros = dados();
      parametros.servicos[0].servico = "outros";
      parametros.servicos[0].servico_especifico = "Limpeza";
      await acao(parametros);
      const payload = requisicao.mock.calls[0][0].data as FormData;
      expect(payload.has("servicos[0]servico")).toBe(true);
      expect(payload.get("servicos[0]servico")).toBe("");
      expect(payload.get("servicos[0]servico_especifico")).toBe("Limpeza");
      expect(payload.get("servicos[0]uuid")).toBe("item1");
      expect(payload.get("servicos[0]arquivos[0]uuid")).toBe("anexo1");
    },
  );
  it("envia específico vazio e preserva o UUID ao escolher serviço do catálogo", async () => {
    const parametros = dados();
    parametros.servicos[0].servico_especifico = "Nome anterior";
    await editarSolicitacaoManutencaoAction(parametros);
    const payload = requisicao.mock.calls[0][0].data as FormData;
    expect(payload.get("servicos[0]uuid")).toBe("item1");
    expect(payload.get("servicos[0]servico")).toBe("pintura");
    expect(payload.get("servicos[0]servico_especifico")).toBe("");
    expect(payload.get("servicos[0]arquivos[0]uuid")).toBe("anexo1");
  });
});

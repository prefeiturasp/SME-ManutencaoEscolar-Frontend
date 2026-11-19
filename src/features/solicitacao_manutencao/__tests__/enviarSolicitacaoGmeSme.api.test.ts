import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { AxiosError } from "axios";
import { beforeEach, expect, it, vi } from "vitest";
import { enviarSolicitacaoGmeSmeAction } from "../services/enviarSolicitacaoGmeSme.api";
import type { EnviarSolicitacaoGmeSmeParams } from "../types/analiseDre.types";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
const requisicao = vi.mocked(requisicaoAutenticada);
const dados: EnviarSolicitacaoGmeSmeParams = {
  uuid: "sol/1",
  decisao: "aprovada_dre",
  observacoes: "Serviço necessário.",
  data_alteracao: "2026-11-18T12:00:00.000Z",
};
beforeEach(() => vi.clearAllMocks());

it("envia os três campos por PUT com enviar=true e UUID codificado", async () => {
  const resposta = {
    dados: {
      uuid: "analise1",
      perfil: "dre",
      decisao: "aprovada_dre",
      observacoes: dados.observacoes,
      data_alteracao: dados.data_alteracao,
    },
    detail: "A solicitação foi enviada para a GME/SME.",
  };
  requisicao.mockResolvedValue(resposta);
  expect(await enviarSolicitacaoGmeSmeAction(dados)).toEqual({ success: true, data: resposta });
  expect(requisicao).toHaveBeenCalledWith({
    method: "PUT",
    url: "/solicitacoes-manutencao/aprovar-solicitacao-pela-dre/sol%2F1",
    data: {
      decisao: "aprovada_dre",
      observacoes: dados.observacoes,
      data_alteracao: dados.data_alteracao,
    },
  });
});

it("trata os erros da API no padrão dos outros services", async () => {
  requisicao.mockRejectedValue(new AxiosError("Falha"));
  expect(await enviarSolicitacaoGmeSmeAction(dados)).toMatchObject({
    success: false,
    error: "api-error",
  });
});

it("propaga erros inesperados para o tratamento do modal", async () => {
  const erro = new Error("Sessão expirada");
  requisicao.mockRejectedValue(erro);
  await expect(enviarSolicitacaoGmeSmeAction(dados)).rejects.toBe(erro);
});

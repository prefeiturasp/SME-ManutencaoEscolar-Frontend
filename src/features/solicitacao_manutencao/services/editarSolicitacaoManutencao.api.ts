"use server";

import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import { obterMensagemErro } from "@/utils/erro";
import axios from "axios";
import type {
  EditarSolicitacaoManutencaoParams,
  EditarSolicitacaoManutencaoResultado,
  SolicitacaoManutencaoCriada,
} from "../types/solicitacaoManutencao.types";
import { prepararServicosEdicao } from "../utils/prepararServicosEdicao";

export async function editarSolicitacaoManutencaoAction(
  dados: Omit<EditarSolicitacaoManutencaoParams, "enviar">,
): Promise<EditarSolicitacaoManutencaoResultado> {
  return editarSolicitacao(dados, false);
}

export async function editarEEnviarSolicitacaoManutencaoAction(
  dados: Omit<EditarSolicitacaoManutencaoParams, "enviar">,
): Promise<EditarSolicitacaoManutencaoResultado> {
  return editarSolicitacao(dados, true);
}

async function editarSolicitacao(
  { uuid, ...dados }: Omit<EditarSolicitacaoManutencaoParams, "enviar">,
  enviar: boolean,
): Promise<EditarSolicitacaoManutencaoResultado> {
  const payload = new FormData();
  payload.append("unidade_educacional", dados.unidade_educacional);
  payload.append("tipo_atendimento", dados.tipo_atendimento);
  payload.append("informacoes_adicionais", dados.informacoes_adicionais ?? "");

  prepararServicosEdicao(dados.servicos).forEach((servico, indice) => {
    const prefixo = `servicos[${indice}]`;
    if (servico.uuid) payload.append(`${prefixo}uuid`, servico.uuid);
    payload.append(`${prefixo}servico`, servico.servico === "outros" ? "" : servico.servico);
    payload.append(`${prefixo}servico_especifico`, servico.servico_especifico ?? "");
    payload.append(`${prefixo}local_reparo`, servico.local_reparo);
    payload.append(`${prefixo}descricao`, servico.descricao);
    servico.arquivos.forEach((anexo, indiceArquivo) => {
      const prefixoArquivo = `${prefixo}arquivos[${indiceArquivo}]`;
      if ("uuid" in anexo) {
        payload.append(`${prefixoArquivo}uuid`, anexo.uuid);
      } else {
        const arquivo = anexo.arquivo[0];
        payload.append(`${prefixoArquivo}arquivo`, arquivo, arquivo.name);
      }
    });
  });

  try {
    const url = `/solicitacoes-manutencao/editar-solicitacao-ue/${encodeURIComponent(uuid)}/`;
    const resposta = await requisicaoAutenticada<SolicitacaoManutencaoCriada>({
      method: "PUT",
      url: enviar ? `${url}?enviar=true` : url,
      data: payload,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, codigo: resposta.codigo };
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const mensagem = obterMensagemErro(error);
    return {
      success: false,
      error: "api-error",
      title: mensagem.titulo,
      message: mensagem.descricao,
      status: mensagem.status,
    };
  }
}

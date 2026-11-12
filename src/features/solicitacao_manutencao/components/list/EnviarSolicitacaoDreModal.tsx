"use client";

import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { toastSucesso } from "@/components/ui/toast-custom";
import { useEditarSolicitacaoManutencao } from "@/features/solicitacao_manutencao/hooks/useEditarSolicitacaoManutencao";
import { solicitacaoManutencaoSchema } from "@/features/solicitacao_manutencao/schemas/solicitacaoManutencaoSchema";
import { buscarSolicitacaoManutencaoAction } from "@/features/solicitacao_manutencao/services/buscarSolicitacaoManutencao.api";
import { useSolicitacaoManutencaoEnviadaStore } from "@/features/solicitacao_manutencao/stores/useSolicitacaoManutencaoEnviadaStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type {
  EditarSolicitacaoManutencaoParams,
  SolicitacaoManutencaoDetalhe,
} from "../../types/solicitacaoManutencao.types";

function prepararEnvio(
  solicitacao: SolicitacaoManutencaoDetalhe,
): EditarSolicitacaoManutencaoParams | null {
  if (solicitacao.situacao !== "nao_enviado_dre") return null;
  const validacao = solicitacaoManutencaoSchema.safeParse({
    unidade_educacional: solicitacao.unidade_educacional?.uuid ?? "",
    tipo_atendimento: solicitacao.tipo_atendimento,
    informacoes_adicionais: solicitacao.informacoes_adicionais ?? "",
    servicos: solicitacao.servicos.map((servico, indice) => ({
      id: servico.uuid ?? String(servico.id ?? indice),
      servico: servico.servico_uuid ?? "outros",
      servico_especifico: servico.servico_especifico ?? undefined,
      local_reparo: servico.local_reparo,
      descricao: servico.descricao,
      arquivos: [],
      arquivosExistentes: servico.arquivos,
    })),
  });
  if (!validacao.success) return null;
  const dados = validacao.data;
  return {
    uuid: solicitacao.uuid,
    enviar: true,
    unidade_educacional: dados.unidade_educacional,
    tipo_atendimento: dados.tipo_atendimento,
    informacoes_adicionais: dados.informacoes_adicionais,
    servicos: dados.servicos.map((servico, indice) => ({
      ...(solicitacao.servicos[indice].uuid ? { uuid: solicitacao.servicos[indice].uuid } : {}),
      servico: servico.servico,
      ...(servico.servico === "outros" ? { servico_especifico: servico.servico_especifico } : {}),
      local_reparo: servico.local_reparo,
      descricao: servico.descricao,
      arquivos: solicitacao.servicos[indice].arquivos.map((arquivo) => ({ uuid: arquivo.uuid })),
    })),
  };
}

export function EnviarSolicitacaoDreModal({
  uuid,
  onFechar,
}: Readonly<{ uuid: string; onFechar: () => void }>) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const {
    data,
    isPending: carregando,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["solicitacoes-manutencao", "detalhe", uuid],
    queryFn: () => buscarSolicitacaoManutencaoAction(uuid),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: editarSolicitacao, isPending: processando } =
    useEditarSolicitacaoManutencao();
  const envioEmAndamento = useRef(false);
  const [erro, setErro] = useState("");
  const payload = data ? prepararEnvio(data) : null;
  const envioDesabilitado = !payload || carregando || isFetching || isError || processando;

  async function enviar() {
    if (envioDesabilitado || !payload || envioEmAndamento.current) return;
    envioEmAndamento.current = true;
    setErro("");
    try {
      const resultado = await editarSolicitacao(payload);
      if (!resultado.success) {
        setErro(resultado.message || resultado.title);
        return;
      }
      onFechar();
      useSolicitacaoManutencaoEnviadaStore.getState().abrir(resultado.codigo, true, true);
      toastSucesso({ titulo: "Sucesso!", descricao: "A solicitação foi enviada com sucesso." });
      void queryClient.refetchQueries({ queryKey: ["solicitacoes-manutencao"], type: "active" });
    } catch {
      setErro("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      envioEmAndamento.current = false;
    }
  }

  return (
    <ConfirmDialog
      open
      size="md"
      title="Envio de solicitação para DRE"
      confirmLabel="Enviar para DRE"
      cancelLabel="Revisar informações"
      loading={processando}
      loadingLabel="Enviando..."
      confirmDisabled={envioDesabilitado}
      closeOnConfirm={false}
      onConfirm={enviar}
      onCancel={() => router.push(`/solicitacao_manutencao/visualizar/${uuid}`)}
      onOpenChange={(aberto) => {
        if (!aberto && !processando) onFechar();
      }}
      description={
        <>
          <p className="text-gray leading-5">
            Revise os dados e verifique se as fotos do local foram anexadas corretamente. Imagens
            nítidas do ambiente e do problema agilizam o diagnóstico. Após confirmar, não será
            possível editar as informações.
          </p>
          {isError && (
            <div role="alert" className="mt-4 text-sm text-destructive">
              Não foi possível carregar a solicitação.{" "}
              <button type="button" className="underline" onClick={() => void refetch()}>
                Tentar novamente
              </button>
            </div>
          )}
          {!carregando && !isFetching && !isError && !payload && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              Revise as informações. A solicitação precisa estar disponível para edição e ter todos
              os dados e anexos obrigatórios para ser enviada.
            </p>
          )}
          {erro && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {erro}
            </p>
          )}
        </>
      }
    />
  );
}

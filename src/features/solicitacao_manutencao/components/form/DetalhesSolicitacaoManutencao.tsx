import type { SolicitacaoManutencaoDetalhe } from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { mapearInformacoesUE } from "@/features/solicitacao_manutencao/utils/mapearInformacoesUE";
import { DadosSolicitacaoManutencao } from "./DadosSolicitacaoManutencao";
import { InformacoesAdicionais } from "./InformacoesAdicionais";
import { VisualizarServicosManutencao } from "./VisualizarServicosManutencao";
import { InformacoesUE } from "./informacoes_ue/InformacoesUE";

export function DetalhesSolicitacaoManutencao({
  solicitacao,
  hrefEditar,
  exibirSituacao = false,
}: Readonly<{
  solicitacao: SolicitacaoManutencaoDetalhe;
  hrefEditar?: string;
  exibirSituacao?: boolean;
}>) {
  return (
    <>
      <InformacoesUE dados={mapearInformacoesUE(solicitacao.unidade_educacional)} />
      <DadosSolicitacaoManutencao
        valor={solicitacao.tipo_atendimento}
        situacao={exibirSituacao ? solicitacao.situacao : undefined}
        somenteLeitura
      />
      <VisualizarServicosManutencao servicos={solicitacao.servicos} hrefEditar={hrefEditar} />
      <InformacoesAdicionais valor={solicitacao.informacoes_adicionais} somenteLeitura />
    </>
  );
}

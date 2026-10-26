import { SolicitacaoManutencaoLista } from "@/features/solicitacao_manutencao/components/list/SolicitacaoManutencaoLista";
import { SolicitacaoManutencaoEnviadaModal } from "@/features/solicitacao_manutencao/components/SolicitacaoManutencaoEnviadaModal";

export default function SolicitacoesPage() {
  return (
    <>
      <SolicitacaoManutencaoLista />
      <SolicitacaoManutencaoEnviadaModal />
    </>
  );
}

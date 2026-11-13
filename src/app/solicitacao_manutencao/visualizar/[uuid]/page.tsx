import { VisualizarSolicitacaoManutencaoPage } from "@/features/solicitacao_manutencao/components/form/VisualizarSolicitacaoManutencaoPage";

export default async function Page({ params }: Readonly<{ params: Promise<{ uuid: string }> }>) {
  const { uuid } = await params;
  return <VisualizarSolicitacaoManutencaoPage uuid={uuid} />;
}

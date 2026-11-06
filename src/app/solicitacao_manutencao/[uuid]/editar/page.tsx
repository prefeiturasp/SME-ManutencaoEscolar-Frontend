import { EditarSolicitacaoManutencaoPage } from "@/features/solicitacao_manutencao/components/form/EditarSolicitacaoManutencaoPage";

export default async function Page({ params }: Readonly<{ params: Promise<{ uuid: string }> }>) {
  const { uuid } = await params;
  return <EditarSolicitacaoManutencaoPage uuid={uuid} />;
}

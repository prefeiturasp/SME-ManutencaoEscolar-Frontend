import { AnalisarSolicitacaoManutencaoPage } from "@/features/solicitacao_manutencao/components/form/AnalisarSolicitacaoManutencaoPage";

export default async function Page({ params }: Readonly<{ params: Promise<{ uuid: string }> }>) {
  const { uuid } = await params;
  return <AnalisarSolicitacaoManutencaoPage uuid={uuid} />;
}

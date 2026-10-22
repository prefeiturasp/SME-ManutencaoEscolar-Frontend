import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SolicitacaoEnviadaModal } from "@/features/solicitacao_manutencao/components/SolicitacaoEnviadaModal";

export default function SolicitacoesPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray">Solicitações de manutenção</h1>
        <Button asChild variant="default" size="big-lg">
          <Link href="/solicitacao_manutencao/nova-solicitacao" className="flex items-center gap-2">
            <PlusIcon />
            Nova solicitação
          </Link>
        </Button>
      </div>
      <SolicitacaoEnviadaModal />
    </>
  );
}

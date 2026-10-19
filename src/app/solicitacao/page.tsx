import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function SolicitacoesPage() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-xl font-semibold text-gray">Solicitações de manutenção</h1>
      <Button asChild variant="default" size="big-lg">
        <Link href="/solicitacao/nova-solicitacao" className="flex items-center gap-2">
          <Plus className="size-5" aria-hidden="true" />
          Nova solicitação
        </Link>
      </Button>
    </div>
  );
}

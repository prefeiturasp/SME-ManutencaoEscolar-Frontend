import { AppShell } from "@/components/layout/AppShell";
import { ProtecaoDeAcesso } from "@/components/shared/ProtecaoDeAcesso/ProtecaoDeAcesso";
import { FUNCIONALIDADES } from "@/constants/funcionalidades";
import { DomainBreadcrumb } from "@/components/navigation/Breadcrumb/DomainBreadcrumb";

const DOMINIOS_SOLICITACAO = {
  "nova-solicitacao": {
    rotuloPlural: "Nova solicitação",
  },
};

export default function SolicitacaoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell>
      <div className="pt-[52px]">
        <DomainBreadcrumb
          basePath="/solicitacao_manutencao"
          baseLabel="Solicitações"
          domains={DOMINIOS_SOLICITACAO}
          className="mb-8 mt-1 text-xs"
        />
        <ProtecaoDeAcesso funcionalidade={FUNCIONALIDADES.SOLICITACAO_MANUTENCAO}>
          {children}
        </ProtecaoDeAcesso>
      </div>
    </AppShell>
  );
}

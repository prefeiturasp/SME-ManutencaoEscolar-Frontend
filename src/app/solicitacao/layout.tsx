import { AppShell } from "@/components/layout/AppShell";
import { DomainBreadcrumb } from "@/components/navigation/Breadcrumb/DomainBreadcrumb";

const DOMINIOS_SOLICITACAO = {
  "nova-solicitacao": {
    rotuloPlural: "Nova solicitação",
  },
};

export default function SolicitacaoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <DomainBreadcrumb
        basePath="/solicitacao"
        baseLabel="Solicitações"
        domains={DOMINIOS_SOLICITACAO}
        className="mb-8 mt-1 text-xs"
      />
      <AppShell>
        <DomainBreadcrumb
          basePath="/solicitacao"
          baseLabel="Solicitações"
          domains={DOMINIOS_SOLICITACAO}
          className="mb-8 mt-1 text-xs"
        />
        {children}
      </AppShell>
    </div>
  );
}

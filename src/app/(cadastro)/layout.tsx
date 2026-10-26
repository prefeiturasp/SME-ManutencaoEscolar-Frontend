import { CadastroBreadcrumb } from "./CadastroBreadcrumb";
import { AppShell } from "@/components/layout/AppShell";
import { ProtecaoDeAcesso } from "@/components/shared/ProtecaoDeAcesso/ProtecaoDeAcesso";
import { FUNCIONALIDADES } from "@/constants/funcionalidades";

type CadastroLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function CadastroLayout({ children }: CadastroLayoutProps) {
  return (
    <div>
      <CadastroBreadcrumb />
      <AppShell>
        <ProtecaoDeAcesso funcionalidade={FUNCIONALIDADES.CADASTROS}>{children}</ProtecaoDeAcesso>
      </AppShell>
    </div>
  );
}

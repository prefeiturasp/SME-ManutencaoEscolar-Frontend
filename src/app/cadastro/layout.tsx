import { CadastroBreadcrumb } from "./CadastroBreadcrumb";
import { AppShell } from "@/components/layout/AppShell";

type CadastroLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function CadastroLayout({ children }: CadastroLayoutProps) {
  return (
    <div className="p-2">
      <CadastroBreadcrumb />
      <AppShell>{children}</AppShell>
    </div>
  );
}

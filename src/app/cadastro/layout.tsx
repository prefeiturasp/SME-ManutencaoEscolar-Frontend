import { AppShell } from "@/components/layout/AppShell";

type CadastroLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function CadastroLayout({ children }: CadastroLayoutProps) {
  return <AppShell>{children}</AppShell>;
}

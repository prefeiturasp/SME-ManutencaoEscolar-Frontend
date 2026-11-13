import { AppShell } from "@/components/layout/AppShell";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex min-h-[90vh] items-center justify-center">
        <ListaVazio
          titulo="Não encontramos esta página"
          descricao={
            "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar."
          }
          textoBotao="Voltar para o início"
          href="/"
          primary
          icone={Home}
        />
      </div>
    </AppShell>
  );
}

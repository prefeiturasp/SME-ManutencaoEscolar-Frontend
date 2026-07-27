import { HomeIcon } from "@/components/icons/HomeIcon";
import { PlusIcon } from "@/components/icons/plus";
import { Breadcrumb } from "@/components/navigation/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ServicosPage() {
  const itens = [
    {
      rotulo: "Início",
      caminho: "/",
      icone: <HomeIcon className="size-4" />,
    },
    {
      rotulo: "Cadastro",
      caminho: "/cadastro",
    },
    {
      rotulo: "Serviços",
      paginaAtual: true,
    },
  ];

  return (
    <div className="p-2">
      <Breadcrumb className="mb-8" itens={itens} />

      <div className="flex items-center justify-between">
        <h1 className=" text-2xl font-semibold">Serviços</h1>
        <Button asChild variant="default" size="big-lg">
          <Link
            href="/cadastro/servicos/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar serviços
          </Link>
        </Button>
      </div>
    </div>
  );
}

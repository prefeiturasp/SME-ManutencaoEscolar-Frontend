import { HomeIcon } from "@/components/icons/HomeIcon";
import { Breadcrumb } from "@/components/navigation/Breadcrumb/Breadcrumb";

export default function CadastroPage() {
  const itens = [
    {
      rotulo: "Início",
      caminho: "/dashboard",
      icone: <HomeIcon className="size-4" />,
    },
    {
      rotulo: "Cadastro",
      paginaAtual: true,
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumb itens={itens} />

      <h1 className="mt-6 text-2xl font-semibold">Cadastro</h1>
    </div>
  );
}

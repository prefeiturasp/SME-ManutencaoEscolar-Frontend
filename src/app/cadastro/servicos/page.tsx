import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";

export default function ServicosPage() {
  return (
    <>
      <CadastroBreadcrumb />
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
    </>
  );
}

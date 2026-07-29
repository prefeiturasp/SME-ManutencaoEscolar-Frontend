import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Listar from "./(listar)/page";

export default function ServicosPage() {
  return (
    <div className="p-2">
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
      <Card>
        <CardTitle className="text-2xl font-bold">Refine sua busca</CardTitle>
        <CardDescription className="text-lg ">
          Utilize o filtro para localizar os serviços cadastrados.
        </CardDescription>
        <Listar />
      </Card>
    </div>
  );
}

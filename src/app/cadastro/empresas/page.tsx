import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";

export default function EmpresasPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className=" text-2xl font-semibold">Empresas</h1>
        <Button asChild variant="default">
          <Link
            href="/cadastro/empresas/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar empresa
          </Link>
        </Button>
      </div>
    </>
  );
}

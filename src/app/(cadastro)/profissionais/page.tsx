import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfissionaisPage() {
  return (
    <>
      <CadastroBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className=" text-2xl font-semibold">Profissionais</h1>
        <Button asChild variant="default">
          <Link
            href="/profissionais/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar profissional
          </Link>
        </Button>
      </div>
    </>
  );
}

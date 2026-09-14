"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ListarCargo() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray">Cargos</h1>
      <Button asChild variant="default" size="big-lg">
        <Link href="/cargos/cadastrar" className="flex items-center gap-2">
          <PlusIcon />
          Cadastrar cargo
        </Link>
      </Button>
    </div>
  );
}

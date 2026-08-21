"use client";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ListarLotes() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray">Lotes</h1>
      <Button asChild variant="default" size="big-sm">
        <Link
          href="/cadastro/lotes/cadastrar"
          className="flex items-center gap-2"
        >
          <PlusIcon />
          Cadastrar lote
        </Link>
      </Button>
    </div>
  );
}

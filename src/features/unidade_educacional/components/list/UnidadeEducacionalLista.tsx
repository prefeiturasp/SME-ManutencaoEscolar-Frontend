"use client";

import Link from "next/link";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";

export function UnidadeEducacionalLista() {

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Unidade Educacional</h1>

        <Button asChild variant="default">
          <Link
            href="/cadastro/empresas/cadastrar"
            className="flex items-center gap-2"
          >
            <PlusIcon />
            Cadastrar unidade
          </Link>
        </Button>
      </div>

      Lista as unidades
    </div>
  );
}

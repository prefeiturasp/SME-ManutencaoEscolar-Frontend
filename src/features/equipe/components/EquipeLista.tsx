"use client";

import Link from "next/link";

import { PlusIcon } from "@/components/icons/plus";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MENSAGEM_ERRO_LISTA = "Não foi possível carregar as equipes.";

export function EquipeLista() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray">Equipes</h1>

        <Button asChild variant="default">
          <Link href="/empresas/equipes/cadastrar" className="flex items-center gap-2">
            <PlusIcon />
            Cadastrar equipe
          </Link>
        </Button>
      </div>

      <Card className="p-6 gap-4">
        <CardHeader className="p-0">
          <CardTitle className="text-gray text-xl font-bold">Equipes cadastradas</CardTitle>
          <CardDescription>
            Estas são as equipes que já estão cadastradas no sistema.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

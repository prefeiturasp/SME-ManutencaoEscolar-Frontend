"use client";

import Link from "next/link";
import { AlertaErro, type AlertaErroProps } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";
import type { DetalheErroExclusaoLote } from "../types/lotes.types";

type AlertaErroExclusaoLoteProps = Omit<AlertaErroProps, "children" | "acoes"> & {
  vinculados: NonNullable<DetalheErroExclusaoLote["equipes"]>;
};

export function AlertaErroExclusaoLote({ vinculados, ...props }: AlertaErroExclusaoLoteProps) {
  return (
    <AlertaErro
      {...props}
      acoes={
        <Button asChild variant="outline">
          <Link href="/empresas/equipes">Cadastro de equipes</Link>
        </Button>
      }
    >
      {vinculados.length > 0 && (
        <div className="overflow-hidden rounded-md text-sm text-gray">
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th scope="col" className="p-2 font-bold">
                  Equipes
                </th>
              </tr>
            </thead>
            <tbody>
              {vinculados.map((equipe) => (
                <tr key={equipe.uuid} className="even:bg-[#FAFAFA]">
                  <td className="break-words p-2">{equipe.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AlertaErro>
  );
}

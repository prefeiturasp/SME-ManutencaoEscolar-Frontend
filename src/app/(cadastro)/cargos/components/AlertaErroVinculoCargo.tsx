"use client";

import Link from "next/link";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { Button } from "@/components/ui/button";

import type { AlertaErroVinculoCargoProps } from "@/features/cargo/types/cargos.types";

function formatarCpf(cpf: string): string {
  const digitos = cpf.replaceAll(/\D/g, "");

  if (digitos.length !== 11) {
    return cpf;
  }

  return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function AlertaErroVinculoCargo({
  aberto,
  titulo,
  mensagem,
  vinculados,
  width,
  onOpenChange,
}: Readonly<AlertaErroVinculoCargoProps>) {
  return (
    <AlertaErro
      aberto={aberto}
      titulo={titulo}
      mensagem={mensagem}
      width={width}
      onOpenChange={onOpenChange}
      acoes={
        <Button asChild variant="outline">
          <Link href="/profissionais">Lista de profissionais</Link>
        </Button>
      }
    >
      {vinculados.length > 0 && (
        <>
          <div className="overflow-hidden rounded-md border text-sm text-[var(--gray)]">
            <table
              className="
                w-full table-fixed border-collapse text-left text-sm
                text-[var(--gray)]
              "
            >
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th scope="col" className="w-1/2 p-2 font-bold">
                    CPF
                  </th>

                  <th scope="col" className="w-1/2 p-2 font-bold">
                    Nome do profissional
                  </th>
                </tr>
              </thead>

              <tbody>
                {vinculados.map(({ cpf, nome }) => (
                  <tr key={cpf} className="border-t even:bg-[#FAFAFA]">
                    <td className="p-2">{formatarCpf(cpf)}</td>
                    <td className="break-words p-2">{nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-[var(--gray)]">
            Você pode remover o vínculo dos profissionais ao cargo que está tentando excluir,
            acessando a listagem de profissionais.
          </p>
        </>
      )}
    </AlertaErro>
  );
}

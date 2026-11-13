import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { AlertaErroExclusaoLote } from "@/features/lotes/components/AlertaErroExclusaoLote";

import type { AlertaErroVinculoLoteProps } from "./types/AlertaErroVinculoLote.types";

export function AlertaErroVinculoLote({
  aberto,
  titulo,
  mensagem,
  vinculados,
  equipes = [],
  width,
  onOpenChange,
}: AlertaErroVinculoLoteProps) {
  if (equipes.length > 0) {
    return (
      <AlertaErroExclusaoLote
        aberto={aberto}
        titulo={titulo}
        mensagem={mensagem}
        vinculados={equipes}
        width={width}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <AlertaErro
      aberto={aberto}
      titulo={titulo}
      mensagem={mensagem}
      width={width}
      onOpenChange={onOpenChange}
    >
      {vinculados.length > 0 && (
        <div className="overflow-hidden rounded-md">
          <table
            className={`
              w-full table-fixed border-collapse text-left text-sm
              text-[var(--gray)]
            `}
          >
            <thead className="bg-[var(--white-smoke)] text-[var(--gray)]">
              <tr>
                <th scope="col" className="w-1/2 p-2 font-bold text-[var(--gray)]">
                  DRE
                </th>

                <th scope="col" className="w-1/2 p-2 font-bold text-[var(--gray)]">
                  Lote
                </th>
              </tr>
            </thead>

            <tbody>
              {vinculados.map(([dre, lote]) => (
                <tr key={`${dre}-${lote}`} className="even:bg-[var(--white-smoke)]">
                  <td className="w-1/2 p-2">{dre}</td>
                  <td className="w-1/2 p-2">{lote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AlertaErro>
  );
}

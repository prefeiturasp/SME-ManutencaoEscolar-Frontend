import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";

import type { AlertaErroVinculoLoteProps } from "./types/AlertaErroVinculoLote.types";

export function AlertaErroVinculoLote({
  aberto,
  titulo,
  mensagem,
  vinculados,
  width,
  onOpenChange,
}: AlertaErroVinculoLoteProps) {
  return (
    <AlertaErro
      aberto={aberto}
      titulo={titulo}
      mensagem={mensagem}
      width={width}
      onOpenChange={onOpenChange}
    >
      {vinculados.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <table
            className={`
              w-full table-fixed border-collapse text-left text-sm
              text-[var(--gray)]
            `}
          >
            <thead className="bg-muted text-[var(--gray)]">
              <tr>
                <th
                  scope="col"
                  className="w-1/2 p-2 font-bold text-[var(--gray)]"
                >
                  DRE
                </th>

                <th
                  scope="col"
                  className="w-1/2 p-2 font-bold text-[var(--gray)]"
                >
                  Lote
                </th>
              </tr>
            </thead>

            <tbody>
              {vinculados.map(([dre, lote]) => (
                <tr key={`${dre}-${lote}`} className="border-t">
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

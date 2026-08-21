import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";

export type VinculoErro = readonly [dre: string, lote: string];

type AlertaErroVinculoLoteProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  vinculados: readonly VinculoErro[];
  width?: number;
  onOpenChange: (aberto: boolean) => void;
}>;

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
              w-full border-collapse text-left text-sm
              text-[var(--gray)]
            `}
          >
            <thead className="bg-muted text-[var(--gray)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">
                  DRE
                </th>

                <th scope="col" className="px-4 py-3 font-bold">
                  Lote
                </th>
              </tr>
            </thead>

            <tbody>
              {vinculados.map(([dre, lote]) => (
                <tr key={`${dre}-${lote}`} className="border-t">
                  <td className="px-4 py-3">{dre}</td>
                  <td className="px-4 py-3">{lote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AlertaErro>
  );
}

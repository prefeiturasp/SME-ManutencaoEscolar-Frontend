import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";

type AlertaErroVinculoEmpresaProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  vinculados: string[];
  onOpenChange: (aberto: boolean) => void;
}>;

export function AlertaErroVinculoEmpresa({
  aberto,
  titulo,
  mensagem,
  vinculados,
  onOpenChange,
}: AlertaErroVinculoEmpresaProps) {
  return (
    <AlertaErro
      aberto={aberto}
      titulo={titulo}
      mensagem={mensagem}
      width={672}
      onOpenChange={onOpenChange}
    >
      {vinculados.length > 1 && (
        <div className="overflow-hidden rounded-md text-sm text-[var(--gray)]">
          <div className="bg-[var(--white-smoke)] px-2 py-2 font-bold">Lotes</div>

          <ul>
            {vinculados.map((lote, indice) => (
              <li key={`${lote}-${indice}`} className="px-2 py-2 even:bg-[var(--white-smoke)]">
                {lote}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AlertaErro>
  );
}

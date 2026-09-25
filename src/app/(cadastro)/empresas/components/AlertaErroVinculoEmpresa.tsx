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
        <div className="overflow-hidden rounded-md border text-sm text-[var(--gray)]">
          <div className="bg-muted px-2 py-2 font-bold">Lotes</div>

          <ul>
            {vinculados.map((lote, indice) => (
              <li key={`${lote}-${indice}`} className="border-t px-2 py-2 even:bg-muted/50">
                {lote}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AlertaErro>
  );
}

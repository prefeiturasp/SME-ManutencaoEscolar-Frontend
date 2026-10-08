import { AlertaErro, type AlertaErroProps } from "@/components/shared/AlertaErro/AlertaErro";
import type { ProfissionalVinculadoEquipe } from "../../types/equipe.types";

type AlertaErroVinculoEquipeProps = Omit<AlertaErroProps, "children"> & {
  vinculados: ProfissionalVinculadoEquipe[];
};

export function AlertaErroVinculoEquipe({ vinculados, ...props }: AlertaErroVinculoEquipeProps) {
  const variosProfissionais = new Set(vinculados.map((item) => item.profissional)).size > 1;

  return (
    <AlertaErro {...props}>
      {vinculados.length > 0 && (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full table-fixed border-collapse text-left text-sm text-[var(--gray)]">
            <thead className="bg-[var(--white-smoke)]">
              <tr>
                {variosProfissionais && (
                  <th scope="col" className="p-2 font-bold">
                    Profissional
                  </th>
                )}
                <th scope="col" className="p-2 font-bold">
                  Equipe
                </th>
              </tr>
            </thead>
            <tbody>
              {vinculados.map(({ profissional, equipe }, index) => (
                <tr
                  key={`${profissional}-${equipe}-${index}`}
                  className="even:bg-[var(--white-smoke)]"
                >
                  {variosProfissionais && <td className="p-2">{profissional}</td>}
                  <td className="p-2">{equipe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AlertaErro>
  );
}

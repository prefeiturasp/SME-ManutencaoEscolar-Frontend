import { cn } from "@/lib/utils";
import type { DataTableProps } from "./types/TabelaDeDados.type";

export function DataTable<T>({
  dados,
  colunas,
  obterChave,
  classNameLinha,
  atualizando = false,
}: Readonly<DataTableProps<T>>) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-b-0 border-gray-light"
      aria-busy={atualizando}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="border-b bg-white-smoke">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.id}
                scope="col"
                className={cn(
                  "border-b border-gray-light px-4 py-3",
                  coluna.classNameCabecalho,
                )}
              >
                {coluna.titulo ?? (
                  <span className="sr-only">{coluna.tituloAcessivel}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dados.map((item) => {
            const classeLinha =
              typeof classNameLinha === "function"
                ? classNameLinha(item)
                : classNameLinha;

            return (
              <tr key={obterChave(item)} className={classeLinha}>
                {colunas.map((coluna) => {
                  const classeCelula =
                    typeof coluna.classNameCelula === "function"
                      ? coluna.classNameCelula(item)
                      : coluna.classNameCelula;

                  return (
                    <td
                      key={coluna.id}
                      className={cn(
                        "border-b border-gray-light px-2 py-4",
                        classeCelula,
                      )}
                    >
                      {coluna.renderizar(item)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

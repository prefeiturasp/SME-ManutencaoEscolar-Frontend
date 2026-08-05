import { cn } from "@/lib/utils";

import { Key, ReactNode } from "react";

type ColunaTabela<T> = {
  id: string;
  titulo?: string;
  tituloAcessivel?: string;
  classNameCabecalho?: string;
  classNameCelula?: string | ((item: T) => string);
  renderizar: (item: T) => ReactNode;
};

type TabelaDeDadosProps<T> = {
  dados: T[];
  colunas: ColunaTabela<T>[];
  obterChave: (item: T) => Key;
  classNameLinha?: string | ((item: T) => string);
  atualizando?: boolean;
};

export function TabelaDeDados<T>({
  dados,
  colunas,
  obterChave,
  classNameLinha,
  atualizando = false,
}: Readonly<TabelaDeDadosProps<T>>) {
  return (
    <div className="overflow-hidden rounded-lg border" aria-busy={atualizando}>
      <table className="w-full border-collapse text-sm">
        <thead className="border-b bg-[var(--tr-color)]">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.id}
                scope="col"
                className={cn("border-b px-4 py-3", coluna.classNameCabecalho)}
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
                      className={cn("border-b px-2 py-4", classeCelula)}
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

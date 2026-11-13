import type { Key, ReactNode } from "react";

export type ColunaTabela<T> = {
  id: string;
  titulo?: string;
  tituloAcessivel?: string;
  classNameCabecalho?: string;
  classNameCelula?: string | ((item: T) => string);
  renderizar: (item: T) => ReactNode;
};

export type DataTableProps<T> = {
  dados: T[];
  colunas: ColunaTabela<T>[];
  obterChave: (item: T) => Key;
  classNameLinha?: string | ((item: T) => string);
  atualizando?: boolean;
};

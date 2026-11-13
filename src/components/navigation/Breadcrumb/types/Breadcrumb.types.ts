import type { ReactNode } from "react";

export type ItemBreadcrumb = {
  rotulo: string;
  caminho?: string;
  icone?: ReactNode;
  paginaAtual?: boolean;
};

export type PropriedadesBreadcrumb = Readonly<{
  itens: ItemBreadcrumb[];
  className?: string;
}>;

export type PropriedadesItemBreadcrumb = Readonly<{
  item: ItemBreadcrumb;
}>;

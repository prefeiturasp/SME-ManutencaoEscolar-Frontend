import Link from "next/link";

import type { PropriedadesItemBreadcrumb } from "./types/Breadcrumb.types";

export function BreadcrumbItem({ item }: PropriedadesItemBreadcrumb) {
  const conteudo = (
    <>
      {item.icone}

      <span>{item.rotulo}</span>
    </>
  );

  if (item.paginaAtual || !item.caminho) {
    return (
      <span
        aria-current={item.paginaAtual ? "page" : undefined}
        className="flex items-center gap-2"
      >
        {conteudo}
      </span>
    );
  }

  return (
    <Link href={item.caminho} className="flex items-center gap-2">
      {conteudo}
    </Link>
  );
}

import { cn } from "@/lib/utils";

import { BreadcrumbSeparator } from "../Breadcrumb/BreadcrumbSeparator";
import { BreadcrumbItem } from "./BreadcrumbItem";
import type { PropriedadesBreadcrumb } from "./types/Breadcrumb.types";
import Link from "next/link";

export function Breadcrumb({ itens, className }: PropriedadesBreadcrumb) {
  if (itens.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-3 text-xs">
        {itens.map((item, indice) => {
          const ultimoItem = indice === itens.length - 1;
          const itemSeguinte = ultimoItem ? null : itens[indice + 1];
          const itemSeguinteEhUltimo = itemSeguinte
            ? indice + 1 === itens.length - 1
            : false;

          return (
            <li
              key={`${item.rotulo}-${indice}`}
              className="flex items-center gap-3"
            >
              <BreadcrumbItem item={item} />

              {!ultimoItem && itemSeguinte && !itemSeguinteEhUltimo ? (
                <Link
                  href={String(itemSeguinte.caminho)}
                  className="flex items-center gap-2"
                >
                  <BreadcrumbSeparator />
                </Link>
              ) : (
                !ultimoItem && <BreadcrumbSeparator />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

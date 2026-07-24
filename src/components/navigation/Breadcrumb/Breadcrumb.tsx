import { cn } from "@/lib/utils";

import { BreadcrumbSeparator } from "../Breadcrumb/BreadcrumbSeparator";
import { BreadcrumbItem } from "./BreadcrumbItem";
import type { PropriedadesBreadcrumb } from "./types/Breadcrumb.types";

export function Breadcrumb({ itens, className }: PropriedadesBreadcrumb) {
  if (itens.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-3">
        {itens.map((item, indice) => {
          const ultimoItem = indice === itens.length - 1;

          return (
            <li
              key={`${item.rotulo}-${indice}`}
              className="flex items-center gap-3"
            >
              <BreadcrumbItem item={item} />

              {!ultimoItem && <BreadcrumbSeparator />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

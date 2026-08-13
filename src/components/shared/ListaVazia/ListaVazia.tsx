import ImagemSemServico from "@/assets/images/lista-vazia.png";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { PropriedadesEstadoVazio } from "./types/ListaVazia.type";

export function ListaVazio({
  titulo,
  descricao,
  textoBotao,
  href,
  primary = false,
  icone: Icone = Plus,
}: Readonly<PropriedadesEstadoVazio>) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Image src={ImagemSemServico} alt="" className="mb-4 h-auto w-48" />

      <h3 className="text-xl font-bold text-gray">{titulo}</h3>

      {descricao && (
        <p className="mt-2 whitespace-pre-line text-sm text-gray">
          {descricao}
        </p>
      )}

      {textoBotao && href && (
        <Button
          asChild
          variant={primary ? "default" : "outline"}
          className="mt-4"
        >
          <Link href={href} className="flex items-center gap-2">
            <Icone className="size-4" />
            <span>{textoBotao}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}

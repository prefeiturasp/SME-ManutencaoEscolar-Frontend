"use client";

import { Wrench } from "lucide-react";
import { useParams } from "next/navigation";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { EditarLoteForm } from "@/features/lotes/components/EditarLoteForm";
import { useBuscarLotePorUuid } from "@/features/lotes/hooks/useLotes";

export default function EditarLotePage() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: lote, isLoading, isError } = useBuscarLotePorUuid(uuid);

  return (
    <>
      <CadastroBreadcrumb />

      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingGlobal
            exibir
            titulo="Aguarde um momento!"
            mensagem="Estamos carregando as informações..."
          />
        </div>
      )}

      {!isLoading && (isError || !lote) && (
        <div className="mt-34">
          <ListaVazio
            titulo="Não encontramos esta página"
            descricao={
              "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar."
            }
            textoBotao="Cadastro de Lotes"
            href="/lotes"
            primary
            icone={Wrench}
          />
        </div>
      )}

      {!isLoading && lote && <EditarLoteForm uuid={uuid} lote={lote} />}
    </>
  );
}

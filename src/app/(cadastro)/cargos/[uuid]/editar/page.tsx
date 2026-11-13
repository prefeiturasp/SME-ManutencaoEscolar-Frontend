"use client";

import { Wrench } from "lucide-react";
import { useParams } from "next/navigation";

import { CadastroBreadcrumb } from "@/app/(cadastro)/CadastroBreadcrumb";
import { ListaVazio } from "@/components/shared/ListaVazia/ListaVazia";
import { LoadingGlobal } from "@/components/shared/LoadingGlobal/LoadingGlobal";
import { EditarCargoForm } from "@/features/cargo/components/EditarCargoForm";
import { useBuscarCargoPorUuid } from "@/features/cargo/hooks/useListarCargo";

export default function EditarLotePage() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: cargo, isLoading, isError } = useBuscarCargoPorUuid(uuid);

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

      {!isLoading && (isError || !cargo) && (
        <div className="mt-34">
          <ListaVazio
            titulo="Não encontramos esta página"
            descricao={
              "A página que você procura não está disponível ou o endereço pode estar incorreto.\nVolte para a tela anterior para continuar."
            }
            textoBotao="Cadastro de Cargos"
            href="/cargos"
            primary
            icone={Wrench}
          />
        </div>
      )}

      {!isLoading && cargo && <EditarCargoForm uuid={uuid} cargo={cargo} />}
    </>
  );
}

"use client";
import { AlertaErroVinculoLote } from "@/app/(cadastro)/lotes/components/AlertaErroVinculoLote";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { formatarDataHora } from "@/utils/formatadores";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useEditarLote } from "../hooks/useEditarLote";
import { LoteFormData, LoteSchema } from "../schemas/loteSchema";
import { DreVinculada, Lote } from "../types/lotes.types";
import { FormLote } from "./FormLote";

type EditarLoteFormProps = Readonly<{
  uuid: string;
  lote: Lote;
}>;

export function EditarLoteForm({ uuid, lote }: EditarLoteFormProps) {
  const router = useRouter();

  const { mutate: editarLote } = useEditarLote(uuid);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const [erroAberto, setErroAberto] = useState(false);
  const [dresVinculadas, setDresVinculadas] = useState<DreVinculada[]>([]);

  const { data: respostaEmpresas } = useEmpresas({
    page_size: "all",
  });

  const empresas = Array.isArray(respostaEmpresas)
    ? respostaEmpresas
    : (respostaEmpresas?.results ?? []);

  const empresasOpcoes = empresas.map((empresaItem) => ({
    label: empresaItem.nome,
    value: String(empresaItem.uuid),
  }));

  const { data: respostaDiretoriasRegionais } = useListarDiretoriasRegionais();
  const diretoriasRegionaisOpcoes =
    respostaDiretoriasRegionais?.results.map((diretoria) => ({
      label: diretoria.nome_curto || diretoria.nome,
      value: String(diretoria.id),
    })) ?? [];

  const methods = useForm<LoteFormData>({
    resolver: zodResolver(LoteSchema),
    mode: "onChange",
    defaultValues: {
      codigo_cadastro: lote.codigo_cadastro,
      nome: lote.nome ?? "",
      empresa: lote.empresa ? String(lote.empresa.uuid) : "",
      periodo_inicial: lote.periodo_inicial ?? "",
      periodo_final: lote.periodo_final ?? "",
      status: lote.status ? "true" : "false",
      diretorias_regionais:
        lote.diretorias_regionais?.map((diretoria) => String(diretoria.id)) ??
        [],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = methods;

  function onSubmit(dados: LoteFormData) {
    editarLote(dados, {
      onSuccess: (resultado) => {
        if (!resultado.success) {
          if (resultado.status === 400) {
            setMensagemErro(resultado.message);
            setMensagemErroTitulo(resultado.title);
            setDresVinculadas(resultado.vinculados ?? []);
            setErroAberto(true);

            return;
          }

          toastErro({
            titulo: resultado.title,
            descricao: resultado.message,
          });
          router.replace("/lotes");

          return;
        }

        toastSucesso({
          titulo: "Sucesso!",
          descricao: "As alterações foram salvas.",
        });

        router.replace("/lotes");
      },

      onError: (error) => {
        console.error("Erro inesperado ao editar lote:", error);

        toastErro({
          titulo: "Erro",
          descricao:
            "Não conseguimos salvar as alterações. Por favor, tente novamente.",
        });
      },
    });
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Editar Lote</h1>

            <div className="flex gap-2">
              <Button
                asChild
                type="button"
                variant="outline"
                size="big-lg"
                className="max-w-[88px]"
              >
                <Link href="/lotes">Cancelar</Link>
              </Button>

              <Button
                type="submit"
                variant="default"
                size="big-lg"
                className="max-w-[72px]"
                disabled={!isValid || !isDirty}
              >
                Salvar
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-muted-foreground">
              Preencha as informações e clique em “salvar” para armazenar os
              dados.
            </CardTitle>

            <FormLote
              empresasOpcoes={empresasOpcoes}
              diretoriasRegionaisOpcoes={diretoriasRegionaisOpcoes}
            />

            <div className="font-bold text-xs mt-2 text-gray">
              <p className="">
                INSERIDO por {lote.criado_por_nome ?? "Não informado"} (
                {lote.username}) em {formatarDataHora(lote.criado_em)}
              </p>

              <p className="">
                ALTERADO por {lote.atualizado_por_nome ?? "Não informado"} (
                {lote.username}) em {formatarDataHora(lote.atualizado_em)}
              </p>
            </div>
          </Card>
        </form>
      </FormProvider>

      <AlertaErroVinculoLote
        aberto={erroAberto}
        titulo={mensagemErroTitulo}
        mensagem={mensagemErro}
        width={672}
        vinculados={dresVinculadas}
        onOpenChange={setErroAberto}
      />
    </div>
  );
}

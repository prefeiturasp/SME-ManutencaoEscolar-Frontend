"use client";

import { CadastroBreadcrumb } from "@/app/cadastro/CadastroBreadcrumb";
import { AlertaErroVinculoLote } from "@/app/cadastro/lotes/components/AlertaErroVinculoLote";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { FormLote } from "@/features/lotes/components/FormLote";
import { useCriarLote } from "@/features/lotes/hooks/useCriarLote";
import {
  LoteSchema,
  type LoteFormData,
} from "@/features/lotes/schemas/loteSchema";
import type { DreVinculada } from "@/features/lotes/types/lotes.types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function CadastrarLotePage() {
  const methods = useForm<LoteFormData>({
    resolver: zodResolver(LoteSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      status: undefined,
      codigo_cadastro: "",
      empresa: "",
      periodo_inicial: "",
      periodo_final: "",
      diretorias_regionais: [],
    },
  });

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

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = methods;

  const { mutate } = useCriarLote();
  const [erroAberto, setErroAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const [dresVinculadas, setDresVinculadas] = useState<DreVinculada[]>([]);

  function onSubmit(dados: LoteFormData) {
    mutate(dados, {
      onSuccess: (resultado) => {
        if (resultado.success) {
          toastSucesso({
            titulo: "Sucesso!",
            descricao: "O lote foi cadastrado.",
          });

          return;
        }

        if (resultado.status === 400) {
          setMensagemErro(resultado.message);
          setMensagemErroTitulo(resultado.title);
          setDresVinculadas(resultado.vinculados ?? []);
          setErroAberto(true);

          return;
        }

        toastErro({
          titulo: resultado.title,
          descricao:
            resultado.message ||
            "Não conseguimos cadastrar o lote. Tente novamente.",
        });
      },

      onError: (error) => {
        console.error("Erro inesperado ao cadastrar lote:", error);

        toastErro({
          titulo: "Erro",
          descricao: "Ocorreu um erro inesperado ao cadastrar o lote.",
        });
      },
    });
  }

  return (
    <>
      <CadastroBreadcrumb />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Cadastro de lote</h1>

            <div className="flex gap-2">
              <Link href="/cadastro/lotes/" className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="big-lg"
                  className="max-w-[88px]"
                >
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                variant="default"
                size="big-xs"
                disabled={!isValid || isSubmitting}
              >
                Cadastrar lote
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <CardTitle className="text-sm text-[var(--gray)]">
              Preencha as informações e clique em “cadastrar lote” para
              armazenar os dados.
            </CardTitle>

            <FormLote
              empresasOpcoes={empresasOpcoes}
              diretoriasRegionaisOpcoes={diretoriasRegionaisOpcoes}
            />
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
    </>
  );
}

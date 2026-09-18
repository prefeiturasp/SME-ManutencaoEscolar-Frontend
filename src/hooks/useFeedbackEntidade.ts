"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

type ResultadoFeedback<TVinculado> =
  | { success: true }
  | {
      success: false;
      status?: number;
      title?: string;
      message?: string;
      vinculados?: TVinculado[];
    };

type UseFeedbackEntidadeProps = {
  mensagemSucesso: string;
  contextoErro: string;
  rotaRetorno: string;
};

export function useFeedbackEntidade<TVinculado = never>({
  mensagemSucesso,
  contextoErro,
  rotaRetorno,
}: UseFeedbackEntidadeProps) {
  const router = useRouter();

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const [erroAberto, setErroAberto] = useState(false);
  const [vinculados, setVinculados] = useState<TVinculado[]>([]);

  function tratarResultado(resultado: ResultadoFeedback<TVinculado>) {
    if (resultado.success) {
      toastSucesso({
        titulo: "Sucesso!",
        descricao: mensagemSucesso,
      });

      router.replace(rotaRetorno);
      return;
    }

    if (resultado.status === 400) {
      setMensagemErro(resultado.message ?? "");
      setMensagemErroTitulo(resultado.title ?? "Erro");
      setVinculados(resultado.vinculados ?? []);
      setErroAberto(true);
      return;
    }

    toastErro({
      titulo: resultado.title ?? "Erro",
      descricao: resultado.message ?? "Não foi possível salvar.",
    });

    router.replace(rotaRetorno);
  }

  function tratarErroInesperado(error: unknown) {
    console.error(`Erro inesperado ao ${contextoErro}:`, error);

    toastErro({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });
  }

  return {
    tratarResultado,
    tratarErroInesperado,
    alertaProps: {
      aberto: erroAberto,
      titulo: mensagemErroTitulo,
      mensagem: mensagemErro,
      vinculados,
      onOpenChange: setErroAberto,
    },
  };
}

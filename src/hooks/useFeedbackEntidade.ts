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
  mensagemSucesso: string | (() => string);
  contextoErro: string;
  rotaRetorno: string;
  erroEmToast?: boolean;
  redirecionarEmErro?: boolean;
  mensagemErro?: string;
};

export function useFeedbackEntidade<TVinculado = never>({
  mensagemSucesso,
  contextoErro,
  rotaRetorno,
  erroEmToast = false,
  redirecionarEmErro = true,
  mensagemErro: mensagemErroPersonalizada,
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
        descricao: typeof mensagemSucesso === "function" ? mensagemSucesso() : mensagemSucesso,
      });

      router.replace(rotaRetorno);
      return;
    }

    if (resultado.status === 400 && !erroEmToast) {
      setMensagemErro(resultado.message ?? "");
      setMensagemErroTitulo(resultado.title ?? "Erro");
      setVinculados(resultado.vinculados ?? []);
      setErroAberto(true);
      return;
    }

    toastErro({
      titulo: resultado.title ?? "Erro",
      descricao: mensagemErroPersonalizada ?? resultado.message ?? "Não foi possível salvar.",
    });

    if (redirecionarEmErro) router.replace(rotaRetorno);
  }

  function tratarErroInesperado(error: unknown) {
    console.error(`Erro inesperado ao ${contextoErro}:`, error);

    toastErro({
      titulo: "Erro",
      descricao:
        mensagemErroPersonalizada ??
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

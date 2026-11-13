import { useRouter } from "next/navigation";
import { useState } from "react";

import { toastErro, toastSucesso } from "@/components/ui/toast-custom";

import type { CriarLoteResultado, DreVinculada, EquipeVinculadaLote } from "../types/lotes.types";

type UseFeedbackLoteProps = {
  mensagemSucesso: string;
  contextoErro: string;
};

export function useFeedbackLote({ mensagemSucesso, contextoErro }: UseFeedbackLoteProps) {
  const router = useRouter();

  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemErroTitulo, setMensagemErroTitulo] = useState("");
  const [erroAberto, setErroAberto] = useState(false);
  const [dresVinculadas, setDresVinculadas] = useState<DreVinculada[]>([]);
  const [equipes, setEquipes] = useState<EquipeVinculadaLote[]>([]);

  function tratarResultado(resultado: CriarLoteResultado) {
    if (!resultado.success) {
      if (resultado.status === 400) {
        setMensagemErro(resultado.message);
        setMensagemErroTitulo(resultado.title);
        setDresVinculadas(resultado.vinculados ?? []);
        setEquipes(resultado.equipes ?? []);
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
      descricao: mensagemSucesso,
    });

    router.replace("/lotes");
  }

  function tratarErroInesperado(error: unknown) {
    console.error(`Erro inesperado ao ${contextoErro}:`, error);

    toastErro({
      titulo: "Erro",
      descricao: "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });
  }

  return {
    tratarResultado,
    tratarErroInesperado,
    alertaProps: {
      aberto: erroAberto,
      titulo: mensagemErroTitulo,
      mensagem: mensagemErro,
      vinculados: dresVinculadas,
      equipes,
      onOpenChange: setErroAberto,
    },
  };
}

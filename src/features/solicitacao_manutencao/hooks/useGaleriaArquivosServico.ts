"use client";

import { useEffect, useState } from "react";
import type { ArquivoVisualizacao } from "@/components/shared/VisualizadorImagens/VisualizadorImagens";

export function useGaleriaArquivosServico(
  arquivos: File[],
  existentes: { uuid: string; arquivo: string; nome_original?: string | null }[],
  habilitada: boolean,
) {
  const [novasPrevias, setNovasPrevias] = useState<ArquivoVisualizacao[]>([]);
  const [indice, setIndice] = useState(0);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
    if (!habilitada) return;
    const urls = arquivos.map((arquivo) => ({
      arquivo: URL.createObjectURL(arquivo),
      nome: arquivo.name,
    }));
    let ativo = true;
    Promise.resolve(urls).then((previas) => {
      if (ativo) setNovasPrevias(previas);
    });
    return () => {
      ativo = false;
      urls.forEach((previa) => URL.revokeObjectURL(previa.arquivo));
    };
  }, [arquivos, habilitada]);
  const previas: ArquivoVisualizacao[] = [...existentes, ...novasPrevias];
  const indiceAtual = Math.min(indice, Math.max(previas.length - 1, 0));
  const atual = previas[indiceAtual];
  const podeBaixar = Boolean(atual && /^(https?:\/\/|blob:|\/(?!\/))/i.test(atual.arquivo));
  async function baixar() {
    if (!atual || !podeBaixar) return;
    setBaixando(true);
    setErro("");
    try {
      const resposta = await fetch(atual.arquivo);
      if (!resposta.ok) throw new Error("Falha no download");
      const url = URL.createObjectURL(await resposta.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = atual.nome_original?.trim() || atual.nome || "imagem";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não foi possível baixar a imagem. Tente novamente.");
    } finally {
      setBaixando(false);
    }
  }
  return { previas, indiceAtual, setIndice, podeBaixar, baixando, baixar, erro };
}

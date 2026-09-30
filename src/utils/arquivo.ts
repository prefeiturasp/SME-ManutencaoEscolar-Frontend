import { toastErro } from "@/components/ui/toast-custom";

interface ArquivoParaDownload {
  readonly nome: string;
  readonly url?: string;
}

export async function baixarArquivo({ nome, url }: ArquivoParaDownload) {
  if (!url) return;

  try {
    const resposta = await fetch(url, { credentials: "include" });

    if (!resposta.ok) {
      throw new Error(`Falha no download: HTTP ${resposta.status}`);
    }

    const urlTemporaria = URL.createObjectURL(await resposta.blob());
    const link = document.createElement("a");

    link.href = urlTemporaria;
    link.download = nome;
    link.hidden = true;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(urlTemporaria), 0);
  } catch {
    toastErro({
      titulo: "Erro ao baixar arquivo",
      descricao: "Não foi possível baixar o arquivo. Tente novamente.",
    });
  }
}

import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";

export function useOpcoesLote() {
  const { data: respostaEmpresas } = useEmpresas({
    page_size: "all",
  });

  const empresas = Array.isArray(respostaEmpresas)
    ? respostaEmpresas
    : (respostaEmpresas?.results ?? []);

  const empresasOpcoes = empresas.map((empresa) => ({
    label: empresa.nome,
    value: String(empresa.uuid),
  }));

  const { data: respostaDiretorias } = useListarDiretoriasRegionais();

  const diretoriasRegionaisOpcoes =
    respostaDiretorias?.results.map((diretoria) => ({
      label: diretoria.nome_curto || diretoria.nome,
      value: String(diretoria.id),
    })) ?? [];

  return {
    empresasOpcoes,
    diretoriasRegionaisOpcoes,
  };
}

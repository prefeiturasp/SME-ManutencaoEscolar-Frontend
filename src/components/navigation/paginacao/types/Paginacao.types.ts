export type PropriedadesPaginacao = {
  paginaAtual: number;
  totalRegistros: number;
  registrosPorPagina: number;
  onMudarPagina: (pagina: number) => void;
  onMudarRegistrosPorPagina: (quantidade: number) => void;
};

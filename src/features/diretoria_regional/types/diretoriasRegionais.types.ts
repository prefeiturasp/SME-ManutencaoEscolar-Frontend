export type DiretoriaRegional = {
  id: number;
  codigo: string;
  nome: string;
  abreviacao: string;
  nome_curto: string;
};

export type RespostaDiretoriasRegionais = {
  count: number;
  next: string | null;
  previous: string | null;
  results: DiretoriaRegional[];
};

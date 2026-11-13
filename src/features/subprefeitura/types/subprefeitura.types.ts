export type Subprefeitura = {
  id: number;
  uuid: string;
  codigo_eol: string;
  nome: string;
};

export type RespostaSubprefeitura = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subprefeitura[];
};

export type SubprefeituraListParams = {
  codigo_eol?: string;
  nome?: string;
  diretoria_regional?: string;
  page?: number;
  page_size?: string | number;
};

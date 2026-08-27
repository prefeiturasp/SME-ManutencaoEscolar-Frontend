export type TipoUnidade = {
  id: number;
  uuid: string;
  codigo_eol: string;
  sigla: string;
};

export type RespostaTipoUnidade = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TipoUnidade[];
};

export type UnidadeTipoUnidadeListParams = {
  codigo_eol?: string;
  tipo_escola?: string;
  diretoria_regional?: string;
  unidade_educacional?: string;
  subprefeitura?: string;
  lote?: string;
  status?: string;
  page?: number;
  page_size?: string | number;
};

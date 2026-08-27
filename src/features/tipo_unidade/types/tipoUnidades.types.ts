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

export type TipoUnidadeListParams = {
  sigla?: string;
  page?: number;
  page_size?: string | number;
};

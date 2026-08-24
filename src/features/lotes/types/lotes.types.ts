export type LoteCriado = {
  id: number;
  uuid: string;
  codigo_cadastro: string;
  nome: string;
  status: boolean;
  periodo_inicial: string;
  periodo_final: string;
};

export type DreVinculada = [dre: string, lote: string];

export type CriarLoteResultado =
  | {
      success: true;
      lote: LoteCriado;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      vinculados?: DreVinculada[];
      status?: number;
    };

export type DetalheErro = {
  message?: string;
  vinculados?: DreVinculada[];
};

export type ErroApi = {
  title?: string;
  detail?: string | DetalheErro;
  message?: string;
  codigo_cadastro?: string[];
  nome?: string[];
  empresa?: string[];
  periodo_inicial?: string[];
  periodo_final?: string[];
  diretorias_regionais?: string[];
  non_field_errors?: string[];
};

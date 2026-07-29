export type ServiceFormData = {
  id: number;
  uuid: string;
  nome: string;
  status: boolean;
};

export type CriarServicoResultado =
  | {
      success: true;
      service: ServiceFormData;
    }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type Servico = {
  id: number;
  uuid: string;
  nome: string;
  status: boolean;
};

export type FiltrosServico = {
  nome?: string;
  status?: boolean;
};

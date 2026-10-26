import type { z } from "zod";
import type { servicoManutencaoSchema } from "../schemas/adicionarServicoManutencaoSchema";
import type { dadosSolicitacaoManutencaoSchema } from "../schemas/dadosSolicitacaoManutencaoSchema";
import type { solicitacaoManutencaoSchema } from "../schemas/solicitacaoManutencaoSchema";

export type ServicoManutencao = z.infer<typeof servicoManutencaoSchema>;
export type TipoAtendimento = z.infer<typeof dadosSolicitacaoManutencaoSchema>["tipo_atendimento"];
export type SolicitacaoManutencaoFormData = z.infer<typeof solicitacaoManutencaoSchema>;

export type AdicionarServicoManutencaoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  opcoes: readonly { value: string; label: string }[];
  onAdicionar: (servico: ServicoManutencao) => void;
  servicoInicial?: ServicoManutencao;
}>;

export type DadosSolicitacaoManutencaoProps = Readonly<{
  valor?: TipoAtendimento | "";
  onChange?: (valor: TipoAtendimento) => void;
  onBlur?: () => void;
  erro?: string;
  className?: string;
}>;

export type InformacoesAdicionaisProps = Readonly<{
  valor?: string;
  onChange?: (valor: string) => void;
  className?: string;
}>;

export type DadosInformacoesUE = {
  codesc: string;
  tipoEscola: string;
  dre: string;
  unidadeEducacional: string;
  subprefeitura: string;
  lote: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type InformacoesUEProps = Readonly<{
  dados: Partial<DadosInformacoesUE>;
  className?: string;
}>;

export type ServicosManutencaoProps = Readonly<{
  valor?: ServicoManutencao[];
  onChange?: (servicos: ServicoManutencao[]) => void;
}>;

export type ConfirmarSolicitacaoManutencaoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: () => void;
  onEnviar: () => void;
  processando?: boolean;
  erro?: string;
}>;

export type CriarSolicitacaoManutencaoParams = Omit<SolicitacaoManutencaoFormData, "servicos"> & {
  servicos: (Omit<ServicoManutencao, "id" | "arquivos"> & {
    arquivos: { arquivo: [File] }[];
  })[];
  enviar?: boolean;
};

export type SolicitacaoManutencaoCriada = {
  codigo: string | number;
};

export type CriarSolicitacaoManutencaoResultado =
  | { success: true; codigo: SolicitacaoManutencaoCriada["codigo"] }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type SolicitacaoManutencaoEnviadaState = {
  codigo: string | number | null;
  enviada: boolean;
  abrir: (codigo: string | number, enviada?: boolean) => void;
  fechar: () => void;
};

export type ModalCodigoProps = Readonly<{
  codigo: string | number;
  enviada: boolean;
  onFechar: () => void;
}>;

export type SolicitacaoManutencaoResumo = {
  uuid: string;
  codigo: string | number;
  tipo_atendimento: TipoAtendimento;
  data_envio: string | null;
  fase: string;
  situacao: string;
};

export type RespostaSolicitacoesManutencao = {
  count: number;
  next: string | null;
  previous: string | null;
  results: SolicitacaoManutencaoResumo[];
};

export type SolicitacaoManutencaoFiltrosValues = {
  codigo: string;
  fase: string[];
  situacao: string[];
  tipo_atendimento: string[];
  data_envio_before: string;
  data_envio_after: string;
};

export type SolicitacaoManutencaoListParams = Partial<
  Omit<SolicitacaoManutencaoFiltrosValues, "fase" | "situacao" | "tipo_atendimento">
> & {
  fase?: string;
  situacao?: string;
  tipo_atendimento?: string;
  page: number;
  page_size: number;
};

export type SolicitacaoManutencaoFiltrosProps = Readonly<{
  values: SolicitacaoManutencaoFiltrosValues;
  onChange: <Campo extends keyof SolicitacaoManutencaoFiltrosValues>(
    campo: Campo,
    valor: SolicitacaoManutencaoFiltrosValues[Campo],
  ) => void;
  onSearch: () => void;
  onClear: () => void;
}>;

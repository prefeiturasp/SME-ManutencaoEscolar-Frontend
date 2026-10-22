import type { z } from "zod";
import type { servicoManutencaoSchema } from "../schemas/adicionarServicoSchema";
import type { dadosSolicitacaoSchema } from "../schemas/dadosSolicitacaoSchema";
import type { solicitacaoSchema } from "../schemas/solicitacaoSchema";

export type ServicoManutencao = z.infer<typeof servicoManutencaoSchema>;
export type TipoAtendimento = z.infer<typeof dadosSolicitacaoSchema>["tipo_atendimento"];
export type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

export type AdicionarServicoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  opcoes: readonly { value: string; label: string }[];
  onAdicionar: (servico: ServicoManutencao) => void;
  servicoInicial?: ServicoManutencao;
}>;

export type DadosSolicitacaoProps = Readonly<{
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

export type ConfirmarSolicitacaoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  onSalvar: () => void;
  onEnviar: () => void;
  processando?: boolean;
  erro?: string;
}>;

export type CriarSolicitacaoParams = Omit<SolicitacaoFormData, "servicos"> & {
  servicos: (Omit<ServicoManutencao, "id" | "arquivos"> & {
    arquivos: { arquivo: [File] }[];
  })[];
  enviar?: boolean;
};

export type SolicitacaoCriada = {
  codigo: string | number;
};

export type CriarSolicitacaoResultado =
  | { success: true; codigo: SolicitacaoCriada["codigo"] }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

export type SolicitacaoEnviadaState = {
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

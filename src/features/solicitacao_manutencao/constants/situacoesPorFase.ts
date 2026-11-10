import type { Opcao } from "@/components/types/opcao.types";

export const SITUACOES_POR_FASE: Readonly<Record<string, readonly Opcao[]>> = {
  solicitacao: [
    { value: "nao_enviado_dre", label: "Não enviada para DRE" },
    { value: "aguardando_analise_dre", label: "Aguardando análise da DRE" },
    { value: "aprovada_dre", label: "Aprovada (DRE)" },
    { value: "reprovada_dre", label: "Reprovada (DRE)" },
    { value: "necessidade_revisao_ue", label: "Necessidade de revisão (UE)" },
    { value: "aguardando_analise_gme_sme", label: "Aguardando análise GME/SME" },
    { value: "aprovada_gme_sme", label: "Aprovada (GME/SME)" },
    { value: "reprovada_gme_sme", label: "Reprovada (GME/SME)" },
    { value: "necessidade_revisao_dre", label: "Necessidade de revisão (DRE)" },
  ],
  vistoria: [
    { value: "vistoria_aguardando_agendamento", label: "Vistoria aguardando agendamento" },
    { value: "vistoria_agendada", label: "Vistoria agendada" },
    { value: "vistoria_atrasada", label: "Vistoria atrasada" },
    { value: "vistoria_realizada", label: "Vistoria realizada" },
    { value: "vistoria_aprovada", label: "Vistoria aprovada" },
    { value: "vistoria_em_revisao", label: "Vistoria em revisão" },
  ],
  execucao: [
    { value: "execucao_aguardando_agendamento", label: "Execução aguardando agendamento" },
    { value: "execucao_agendada", label: "Execução agendada" },
    { value: "execucao_em_andamento", label: "Execução em andamento" },
    { value: "execucao_atrasada", label: "Execução atrasada" },
    { value: "execucao_realizada", label: "Execução realizada" },
    { value: "execucao_com_ateste_ue", label: "Execução com ateste UE" },
  ],
};

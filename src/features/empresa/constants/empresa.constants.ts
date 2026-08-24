export const EMPRESA_ETAPAS = [
  { key: "informacoes-gerais", label: "Informações gerais" },
  { key: "responsavel-tecnico", label: "Responsável técnico" },
] as const;

export const TIPO_RESPONSAVEL_TECNICO_OPCOES = [
  { value: "preposto", label: "Preposto" },
  { value: "engenheiro_civil", label: "Engenheiro Civil" },
  { value: "engenheiro_eletricista", label: "Engenheiro Elétrico" },
] as const;

export const TIPO_RESPONSAVEL_TECNICO_VALUES =
  TIPO_RESPONSAVEL_TECNICO_OPCOES.map((tipo) => tipo.value) as [
    (typeof TIPO_RESPONSAVEL_TECNICO_OPCOES)[number]["value"],
    ...(typeof TIPO_RESPONSAVEL_TECNICO_OPCOES)[number]["value"][],
  ];

export const TIPOS_ENGENHEIRO_RESPONSAVEL_TECNICO = [
  "engenheiro_civil",
  "engenheiro_eletricista",
] as const;

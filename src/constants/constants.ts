export const ESTADOS = [
  { value: "AC", label: "AC" },
  { value: "AL", label: "AL" },
  { value: "AP", label: "AP" },
  { value: "AM", label: "AM" },
  { value: "BA", label: "BA" },
  { value: "CE", label: "CE" },
  { value: "DF", label: "DF" },
  { value: "ES", label: "ES" },
  { value: "GO", label: "GO" },
  { value: "MA", label: "MA" },
  { value: "MT", label: "MT" },
  { value: "MS", label: "MS" },
  { value: "MG", label: "MG" },
  { value: "PA", label: "PA" },
  { value: "PB", label: "PB" },
  { value: "PR", label: "PR" },
  { value: "PE", label: "PE" },
  { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" },
  { value: "RN", label: "RN" },
  { value: "RS", label: "RS" },
  { value: "RO", label: "RO" },
  { value: "RR", label: "RR" },
  { value: "SC", label: "SC" },
  { value: "SP", label: "SP" },
  { value: "SE", label: "SE" },
  { value: "TO", label: "TO" },
] as const;

export const ESTADOS_VALUES = ESTADOS.map((estado) => estado.value) as [
  (typeof ESTADOS)[number]["value"],
  ...(typeof ESTADOS)[number]["value"][],
];

export const STATUS_OPCOES = [
  {
    value: "true",
    label: "Ativo",
  },
  {
    value: "false",
    label: "Inativo",
  },
] as const;

export const EMPRESA_ETAPAS = [
  { key: "informacoes-gerais", label: "Informações gerais" },
] as const;

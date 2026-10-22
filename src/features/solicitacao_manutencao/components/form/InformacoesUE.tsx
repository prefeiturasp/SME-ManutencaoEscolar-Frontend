import type {
  DadosInformacoesUE,
  InformacoesUEProps,
} from "@/features/solicitacao_manutencao/types/solicitacao.types";
import { Info, School } from "lucide-react";

import { cn } from "@/lib/utils";

const CAMPOS: { chave: keyof DadosInformacoesUE; rotulo: string }[] = [
  { chave: "codesc", rotulo: "CODESC (Código EOL)" },
  { chave: "tipoEscola", rotulo: "Tipo de escola" },
  { chave: "dre", rotulo: "DRE" },
  { chave: "unidadeEducacional", rotulo: "Unidade Educacional" },
  { chave: "subprefeitura", rotulo: "Subprefeitura" },
  { chave: "lote", rotulo: "Lote" },
  { chave: "cep", rotulo: "CEP" },
  { chave: "logradouro", rotulo: "Logradouro" },
  { chave: "numero", rotulo: "Número" },
  { chave: "bairro", rotulo: "Bairro" },
  { chave: "cidade", rotulo: "Cidade" },
  { chave: "estado", rotulo: "Estado" },
];

export function InformacoesUE({ dados, className }: InformacoesUEProps) {
  return (
    <section
      aria-label="Informações da UE"
      className={cn("rounded-lg bg-white p-6 text-gray", className)}
    >
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <School className="size-5" aria-hidden="true" />
        </span>
        <span>Informações da UE</span>
      </h2>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {CAMPOS.map(({ chave, rotulo }) => (
          <div key={chave} className="min-w-0">
            <dt className="leading-tight">{rotulo}:</dt>
            <dd className="break-words font-semibold leading-tight">
              {dados[chave]?.trim() || "Não informado"}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 flex items-start gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
        <Info className="size-5 shrink-0" aria-hidden="true" />
        <span>
          As informações da unidade educacional são preenchidas automaticamente com os dados
          cadastrados no sistema.
        </span>
      </p>
    </section>
  );
}

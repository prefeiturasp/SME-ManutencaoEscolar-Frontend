"use client";

import type { Opcao } from "@/components/types/opcao.types";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { useLotes } from "@/features/lotes/hooks/useLotes";
import { useTodosProfissionais } from "@/features/profissional/hooks/useProfissionais";
import { calcularDiasParaVencimento } from "@/utils/vencimentoLote";
import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { EquipeFormData } from "../schema/equipeSchema";
import type { EquipeDetalhe } from "../types/equipe.types";

function formatarPeriodoLote(data?: string | null): string {
  if (!data) return "\u2014";
  return data.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
}

export function useOpcoesEquipe(
  empresaSelecionada: string,
  { getValues, setValue }: Pick<UseFormReturn<EquipeFormData>, "getValues" | "setValue">,
  equipe?: EquipeDetalhe,
) {
  const { data: profissionaisData } = useTodosProfissionais();
  const { data: respostaEmpresas } = useEmpresas({
    page_size: "all",
  });

  const profissionaisDisponiveis = (profissionaisData?.results ?? []).filter(
    (profissional) =>
      profissional.status === true ||
      equipe?.profissionais.some((item) => item.profissional === profissional.uuid),
  );

  const profissionaisOpcoes: Opcao[] = profissionaisDisponiveis.map((profissional) => ({
    value: profissional.uuid,
    label: `${profissional.cpf} - ${profissional.nome}`,
  }));

  const empresasDisponiveis = (respostaEmpresas?.results ?? []).filter(
    (empresa) => empresa.status === true || empresa.uuid === equipe?.empresa,
  );

  const empresasOpcoes: Opcao[] = empresasDisponiveis.map((empresa) => ({
    value: empresa.uuid,
    label: `${empresa.cnpj} - ${empresa.nome}`,
  }));

  const empresaId = respostaEmpresas?.results.find(
    (empresa) => empresa.uuid === empresaSelecionada,
  )?.id;

  const { data: respostaLotes } = useLotes(
    { page: 1, page_size: "all", empresa: empresaId },
    { enabled: empresaId !== undefined, keepPreviousData: false },
  );

  const lotesOpcoes: Opcao[] =
    empresaId === undefined
      ? []
      : (respostaLotes?.results ?? [])
          .filter((lote) => {
            const diasParaVencimento = calcularDiasParaVencimento(lote.periodo_final);

            return (
              (Boolean(equipe?.lote) && lote.uuid === equipe?.lote) ||
              (Boolean(lote.uuid) && diasParaVencimento !== null && diasParaVencimento >= 0)
            );
          })
          .map((lote) => ({
            value: lote.uuid!,
            label: `${lote.nome || lote.codigo_cadastro} - ${formatarPeriodoLote(lote.periodo_inicial)} à ${formatarPeriodoLote(lote.periodo_final)}`,
          }));

  const empresaAnterior = useRef(empresaSelecionada);

  useEffect(() => {
    if (empresaAnterior.current === empresaSelecionada) return;
    empresaAnterior.current = empresaSelecionada;
    if (getValues("lote")) {
      setValue("lote", "", { shouldDirty: true, shouldValidate: true });
    }
  }, [empresaSelecionada, getValues, setValue]);

  return { empresasOpcoes, lotesOpcoes, profissionaisOpcoes, profissionaisDisponiveis };
}

"use client";

import type { Opcao } from "@/components/types/opcao.types";
import { useEmpresas } from "@/features/empresa/hooks/useEmpresas";
import { useLotes } from "@/features/lotes/hooks/useLotes";
import { useTodosProfissionais } from "@/features/profissional/hooks/useProfissionais";
import { maskCnpj } from "@/utils/formatadores";
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

  const profissionaisConsultados = (profissionaisData?.results ?? []).filter(
    (profissional) =>
      profissional.status === true ||
      equipe?.profissionais.some((item) => item.profissional === profissional.uuid),
  );

  const profissionaisDisponiveis = [
    ...profissionaisConsultados,
    ...(equipe?.profissionais ?? [])
      .filter((item) => !profissionaisConsultados.some((p) => p.uuid === item.profissional))
      .map((item) => ({
        uuid: item.profissional,
        nome: item.nome,
        cpf: item.cpf,
        funcoes: [{ uuid: item.funcao, nome: item.nome_funcao }],
      })),
  ].map((profissional) => {
    const vinculo = equipe?.profissionais.find((item) => item.profissional === profissional.uuid);
    if (!vinculo || profissional.funcoes.some((funcao) => funcao.uuid === vinculo.funcao))
      return profissional;
    return {
      ...profissional,
      funcoes: [...profissional.funcoes, { uuid: vinculo.funcao, nome: vinculo.nome_funcao }],
    };
  });

  const profissionaisOpcoes: Opcao[] = profissionaisDisponiveis.map((profissional) => ({
    value: profissional.uuid,
    label: `${profissional.cpf} - ${profissional.nome}`,
  }));

  const empresasDisponiveis = (respostaEmpresas?.results ?? []).filter(
    (empresa) => empresa.status === true || empresa.uuid === equipe?.empresa.uuid,
  );

  const empresasOpcoes: Opcao[] = empresasDisponiveis.map((empresa) => ({
    value: empresa.uuid,
    label: `${maskCnpj(empresa.cnpj)} - ${empresa.nome}`,
  }));

  if (equipe && !empresasOpcoes.some((opcao) => opcao.value === equipe.empresa.uuid)) {
    empresasOpcoes.unshift({
      value: equipe.empresa.uuid,
      label: `${maskCnpj(equipe.empresa.cnpj)} - ${equipe.empresa.nome}`,
    });
  }

  const empresaOriginalSelecionada = equipe?.empresa.uuid === empresaSelecionada;
  const empresaId =
    (empresaOriginalSelecionada ? equipe.empresa.id : undefined) ??
    respostaEmpresas?.results.find((empresa) => empresa.uuid === empresaSelecionada)?.id;

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
              (empresaOriginalSelecionada && lote.uuid === equipe?.lote.uuid) ||
              (Boolean(lote.uuid) && diasParaVencimento !== null && diasParaVencimento >= 0)
            );
          })
          .map((lote) => ({
            value: lote.uuid!,
            label: `${lote.nome || lote.codigo_cadastro} - ${formatarPeriodoLote(lote.periodo_inicial)} à ${formatarPeriodoLote(lote.periodo_final)}`,
          }));

  if (
    equipe &&
    empresaOriginalSelecionada &&
    !lotesOpcoes.some((lote) => lote.value === equipe.lote.uuid)
  ) {
    lotesOpcoes.unshift({
      value: equipe.lote.uuid,
      label: `${equipe.lote.nome} - ${formatarPeriodoLote(equipe.lote.periodo_inicial)} à ${formatarPeriodoLote(equipe.lote.periodo_final)}`,
    });
  }

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

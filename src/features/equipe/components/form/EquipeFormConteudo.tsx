"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import type { EquipeFormData } from "@/features/equipe/schema/equipeSchema";
import type { EquipeDetalhe } from "@/features/equipe/types/equipe.types";
import { useOpcoesEquipe } from "@/features/equipe/hooks/useOpcoesEquipe";
import { FormEquipe } from "./EquipeForm";
import { ProfissionaisEquipe } from "./ProfissionaisEquipeForm";

export function EquipeFormConteudo({ equipe }: Readonly<{ equipe?: EquipeDetalhe }>) {
  const methods = useFormContext<EquipeFormData>();
  const empresaSelecionada = useWatch({ control: methods.control, name: "empresa" });
  const [mostrarProfissionais, setMostrarProfissionais] = useState(
    Boolean(equipe?.profissionais.length),
  );
  const { empresasOpcoes, lotesOpcoes, profissionaisOpcoes, profissionaisDisponiveis } =
    useOpcoesEquipe(empresaSelecionada, methods, equipe);
  return (
    <>
      {" "}
      <Card className="p-6">
        <CardTitle className="text-xl font-bold text-gray">Informações da equipe</CardTitle>

        <p className="text-sm text-[var(--gray)]">
          Preencha os dados da equipe e, em seguida, adicione os profissionais que farão parte dela.
        </p>

        <FormEquipe empresasOpcoes={empresasOpcoes} lotesOpcoes={lotesOpcoes} />

        {!mostrarProfissionais && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => setMostrarProfissionais(true)}>
              + Adicionar profissionais
            </Button>
          </div>
        )}
      </Card>
      {mostrarProfissionais && (
        <ProfissionaisEquipe
          profissionaisOpcoes={profissionaisOpcoes}
          profissionais={profissionaisDisponiveis}
        />
      )}
    </>
  );
}

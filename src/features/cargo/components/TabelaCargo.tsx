import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";

import { TabelaCargoProps } from "@/features/cargo/types/cargos.types";

export function TabelaCargo({
  cargos,
  colunas,
  atualizando = false,
}: Readonly<TabelaCargoProps>) {
  return (
    <TabelaDeDados
      dados={cargos}
      colunas={colunas}
      obterChave={(cargo) => cargo.uuid ?? ""}
      atualizando={atualizando}
    />
  );
}

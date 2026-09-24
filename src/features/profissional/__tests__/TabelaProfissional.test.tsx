import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TabelaProfissional } from "@/features/profissional/components/list/TabelaProfissional";
import type { Profissional } from "@/features/profissional/types/profissional.types";
import type { DataTableProps } from "@/components/shared/TabelaDeDados/types/TabelaDeDados.type";

const mocks = vi.hoisted(() => ({
  tabelaDeDados: vi.fn((_props: DataTableProps<Profissional>) => null),
}));

vi.mock("@/components/shared/TabelaDeDados/TabelaDeDados", () => ({
  TabelaDeDados: mocks.tabelaDeDados,
}));

describe("TabelaProfissional", () => {
  beforeEach(() => {
    mocks.tabelaDeDados.mockClear();
  });

  it("usa o uuid do profissional como chave estável da linha", () => {
    const profissional = {
      uuid: "profissional-uuid",
      nome: "João da Silva",
      rg: "123456789",
      cpf: "12345678901",
      status: true,
      funcoes: ["Eletricista"],
    } satisfies Profissional;

    render(
      <TabelaProfissional
        profissionais={[profissional]}
        colunas={[]}
      />,
    );

    const props = mocks.tabelaDeDados.mock.calls[0][0];

    expect(props.obterChave(profissional)).toBe("profissional-uuid");
    expect(props.atualizando).toBe(false);
    expect(typeof props.classNameLinha === "function" && props.classNameLinha(profissional)).toBe("");
    expect(
      typeof props.classNameLinha === "function" &&
        props.classNameLinha({ ...profissional, status: false }),
    ).toBe("bg-background text-blocked-foreground");
  });

  it("encaminha o estado de atualização", () => {
    render(<TabelaProfissional profissionais={[]} colunas={[]} atualizando />);
    expect(mocks.tabelaDeDados.mock.calls[0][0].atualizando).toBe(true);
  });
});

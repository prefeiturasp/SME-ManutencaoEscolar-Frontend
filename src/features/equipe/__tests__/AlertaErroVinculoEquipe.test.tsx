import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { AlertaErroVinculoEquipe } from "../components/AlertaErroVinculoEquipe";
vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    titulo,
    mensagem,
    children,
  }: {
    titulo: string;
    mensagem: string;
    children: ReactNode;
  }) => (
    <div>
      <h2>{titulo}</h2>
      <p>{mensagem}</p>
      {children}
    </div>
  ),
}));
const props = {
  aberto: true,
  titulo: "Conflito",
  mensagem: "Remova os vínculos atuais.",
  onOpenChange: vi.fn(),
};
describe("AlertaErroVinculoEquipe", () => {
  it("exibe título e mensagem sem tabela quando não há vínculos", () => {
    render(<AlertaErroVinculoEquipe {...props} vinculados={[]} />);
    expect(screen.getByText(props.titulo)).toBeInTheDocument();
    expect(screen.getByText(props.mensagem)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("exibe apenas a coluna Equipe para um único profissional", () => {
    render(
      <AlertaErroVinculoEquipe
        {...props}
        vinculados={[
          { profissional: "Ana", equipe: "Equipe 01" },
          { profissional: "Ana", equipe: "Equipe 02" },
        ]}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(1);
    expect(screen.getByRole("columnheader", { name: "Equipe" })).toBeInTheDocument();
    expect(screen.getByText("Equipe 01")).toBeInTheDocument();
    expect(screen.getByText("Equipe 02")).toBeInTheDocument();
  });
  it("exibe profissional e equipe para vários profissionais", () => {
    render(
      <AlertaErroVinculoEquipe
        {...props}
        vinculados={[
          { profissional: "Ana", equipe: "Equipe 01" },
          { profissional: "Bruno", equipe: "Equipe 02" },
        ]}
      />,
    );
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });
});

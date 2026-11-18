import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { VisualizarServicosManutencao } from "../components/form/VisualizarServicosManutencao";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import type { LoginUser } from "@/features/login/types/login.types";

describe("VisualizarServicosManutencao — nome do serviço", () => {
  it("usa nome_servico na tabela e no modal e o serviço específico quando o nome é nulo", async () => {
    render(
      <VisualizarServicosManutencao
        servicos={[
          {
            servico_uuid: "uuid-pintura",
            nome_servico: "Pintura",
            servico_especifico: "",
            local_reparo: "Sala",
            descricao: "Reparo",
            arquivos: [],
          },
          {
            servico_uuid: null,
            nome_servico: null,
            servico_especifico: "Serralheria",
            local_reparo: "Portão",
            descricao: "Reparo",
            arquivos: [],
          },
        ]}
      />,
    );
    expect(screen.getByText("Pintura")).toBeInTheDocument();
    expect(screen.getByText("Serralheria")).toBeInTheDocument();
    expect(screen.queryByText("uuid-pintura")).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Visualizar serviço de Sala" }));
    expect(within(screen.getByRole("dialog")).getByLabelText("Qual o serviço?")).toHaveValue(
      "Pintura",
    );
  });

  it("exibe a ação de detalhes para DRE e informa serviço sem nome", async () => {
    useUsuarioStore.setState({ usuario: { perfil: { codigo: "DRE" } } as LoginUser });
    try {
      render(
        <VisualizarServicosManutencao
          servicos={[
            {
              servico_uuid: null,
              nome_servico: " ",
              servico_especifico: null,
              local_reparo: "Pátio",
              descricao: "Reparo",
              arquivos: [],
            },
          ]}
        />,
      );
      expect(screen.getByText("Os serviços que precisam ser executados.")).toBeInTheDocument();
      expect(screen.getByText("Não informado")).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole("button", { name: "Exibir detalhes do serviço de Pátio" }),
      );
      expect(within(screen.getByRole("dialog")).getByLabelText("Qual o serviço?")).toHaveValue(
        "Não informado",
      );
      expect(
        within(screen.getByRole("dialog")).queryByRole("button", { name: "Editar" }),
      ).not.toBeInTheDocument();
      expect(
        within(screen.getByRole("dialog")).queryByRole("link", { name: "Editar" }),
      ).not.toBeInTheDocument();
    } finally {
      useUsuarioStore.setState({ usuario: null });
    }
  });
});

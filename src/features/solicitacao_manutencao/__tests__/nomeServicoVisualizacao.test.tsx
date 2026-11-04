import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { VisualizarServicosManutencao } from "../components/form/VisualizarServicosManutencao";

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

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VisualizarServicosManutencao } from "../components/form/VisualizarServicosManutencao";
import { VisualizarSolicitacaoManutencaoPage } from "../components/form/VisualizarSolicitacaoManutencaoPage";

const buscar = vi.hoisted(() => vi.fn());
vi.mock("../services/buscarSolicitacaoManutencao.api", () => ({
  buscarSolicitacaoManutencaoAction: buscar,
}));
vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: () => ({
    data: [{ value: "comum", label: "Comum" }],
    isPending: false,
  }),
}));
vi.mock("@/features/servico/hooks/useOpcoesServicos", () => ({
  useOpcoesServicos: () => ({ data: [] }),
}));

function preparar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <VisualizarSolicitacaoManutencaoPage uuid="s1" />
    </QueryClientProvider>,
  );
}

describe("Detalhes da solicitação", () => {
  it("renderiza serviços sem UUID sem aviso de chave do React", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      render(
        <VisualizarServicosManutencao
          servicos={[
            { id: 1, servico: "outros", local_reparo: "Sala 1", descricao: "Reparo", arquivos: [] },
            { servico: "outros", local_reparo: "Sala 2", descricao: "Reparo", arquivos: [] },
            { servico: "outros", local_reparo: "Sala 3", descricao: "Reparo", arquivos: [] },
          ]}
        />,
      );
      expect(screen.getAllByRole("row")).toHaveLength(4);
      expect(consoleError.mock.calls.flat().join(" ")).not.toMatch(/unique.*key/i);
    } finally {
      consoleError.mockRestore();
    }
  });
  it("carrega os detalhes e permite consultar sem editar nem salvar", async () => {
    buscar.mockResolvedValue({
      uuid: "s1",
      codigo: 123,
      tipo_atendimento: "comum",
      unidade_educacional: { nome: "Escola da solicitação" },
      informacoes_adicionais: "Informação preservada",
      servicos: [
        {
          uuid: "sv1",
          servico: "outros",
          servico_especifico: "Pintura",
          local_reparo: "Sala",
          descricao: "Parede danificada",
          arquivos: [
            { uuid: "a1", arquivo: "https://example.com/foto.jpg" },
            { uuid: "a2", arquivo: "https://example.com/foto2.jpg" },
          ],
        },
      ],
    });
    preparar();
    expect(await screen.findByText("Escola da solicitação")).toBeInTheDocument();
    expect(buscar).toHaveBeenCalledWith("s1");
    expect(screen.getByRole("combobox")).toBeDisabled();
    const texto = screen.getByRole("textbox");
    expect(texto).toHaveAttribute("readonly");
    await userEvent.setup().type(texto, "alteração");
    expect(texto).toHaveValue("Informação preservada");
    expect(screen.getByRole("table", { name: "Serviços adicionados" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao",
    );
    expect(
      screen.queryByRole("button", { name: /salvar|editar|remover|adicionar|enviar/i }),
    ).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Visualizar serviço de Sala" }));
    const modal = within(screen.getByRole("dialog"));
    expect(modal.getByLabelText("Qual o serviço?")).toHaveValue("Pintura");
    for (const campo of modal.getAllByRole("textbox")) {
      expect(campo).toHaveAttribute("readonly");
      const inicial = (campo as HTMLInputElement).value;
      await user.type(campo, "alteração");
      expect(campo).toHaveValue(inicial);
    }
    expect(modal.getByLabelText("Breve descrição do serviço")).toHaveValue("Parede danificada");
    expect(modal.getByRole("img")).toHaveAttribute("src", "https://example.com/foto.jpg");
    expect(modal.getByRole("button", { name: "Anexo anterior" })).toBeDisabled();
    await user.click(modal.getByRole("button", { name: "Próximo anexo" }));
    expect(modal.getByRole("img")).toHaveAttribute("src", "https://example.com/foto2.jpg");
    expect(modal.getByRole("button", { name: "Próximo anexo" })).toBeDisabled();
    expect(
      modal.queryByRole("button", { name: /salvar|adicionar|remover|baixar|escolher/i }),
    ).not.toBeInTheDocument();
    await user.click(modal.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra falha e oferece nova tentativa sem exibir dados incompletos", async () => {
    buscar.mockRejectedValue(new Error("Falha na API"));
    preparar();
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

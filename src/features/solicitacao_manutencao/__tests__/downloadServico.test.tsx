import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { VisualizarServicosManutencao } from "../components/form/VisualizarServicosManutencao";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function abrir(url: string) {
  render(
    <VisualizarServicosManutencao
      servicos={[
        {
          nome_servico: "Pintura",
          servico_uuid: "s1",
          servico_especifico: null,
          local_reparo: "Sala",
          descricao: "Reparo",
          arquivos: [{ uuid: "a1", arquivo: url }],
        },
      ]}
    />,
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Visualizar serviço de Sala" }));
  return within(screen.getByRole("dialog"));
}

it("mostra lista vazia sem ações de serviço", () => {
  render(<VisualizarServicosManutencao servicos={[]} />);
  expect(screen.getByText("Nenhum serviço foi adicionado.")).toBeInTheDocument();
});

it.each(["http", "rede"])(
  "informa falha de download (%s) e permite nova tentativa",
  async (tipo) => {
    const fetchMock = vi.fn();
    if (tipo === "http") fetchMock.mockResolvedValue({ ok: false });
    else fetchMock.mockRejectedValue(new Error("Sem conexão"));
    vi.stubGlobal("fetch", fetchMock);
    const modal = await abrir("/foto.jpg");
    await userEvent.setup().click(modal.getByRole("button", { name: "Baixar imagem" }));
    expect(await modal.findByRole("alert")).toHaveTextContent("Não foi possível baixar");
    expect(modal.getByRole("button", { name: "Baixar imagem" })).toBeEnabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
);

it("baixa com nome alternativo e bloqueia novos cliques durante o download", async () => {
  let concluir!: (value: Response) => void;
  const fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        concluir = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const criar = vi.fn(() => "blob:arquivo");
  const revogar = vi.fn();
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = criar;
      static revokeObjectURL = revogar;
    },
  );
  const clicar = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    expect(this.download).toBe("imagem");
  });
  const modal = await abrir("https://example.com/");
  const user = userEvent.setup();
  await user.click(modal.getByRole("button", { name: "Baixar imagem" }));
  expect(modal.getByRole("button", { name: "Baixando..." })).toBeDisabled();
  await user.click(modal.getByRole("button", { name: "Baixando..." }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  concluir({ ok: true, blob: async () => new Blob(["a"]) } as Response);
  await waitFor(() => expect(clicar).toHaveBeenCalled());
  expect(revogar).toHaveBeenCalledWith("blob:arquivo");
});

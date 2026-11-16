import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { AdicionarServicoManutencaoModal } from "../components/form/AdicionarServicoManutencaoModal";
import type { ServicoManutencao } from "../types/solicitacaoManutencao.types";

const mocks = vi.hoisted(() => ({
  galeria: {
    previas: [],
    indiceAtual: 0,
    setIndice: vi.fn(),
    podeBaixar: true,
    baixando: false,
    baixar: vi.fn(),
    erro: "",
  },
  confirmar: undefined as (() => void) | undefined,
}));
vi.mock("../hooks/useGaleriaArquivosServico", () => ({
  useGaleriaArquivosServico: () => mocks.galeria,
}));
vi.mock("@/components/ui/button", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/components/ui/button")>();
  return {
    ...original,
    Button: (props: ComponentProps<typeof Button>) => {
      if (props.children === "Adicionar serviço")
        mocks.confirmar = () => props.onClick?.(undefined as never);
      return <original.Button {...props} />;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.galeria.baixando = false;
  mocks.galeria.erro = "";
  mocks.confirmar = undefined;
});

const inicial: ServicoManutencao = {
  id: "s1",
  servico: "legado",
  nome_servico: "Serviço antigo",
  local_reparo: "Sala",
  descricao: "Reparo",
  arquivos: [],
  arquivosExistentes: [{ uuid: "a1", arquivo: "/foto.jpg" }],
};

it("não confirma dados inválidos mesmo se o callback for chamado diretamente", () => {
  const onAdicionar = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <AdicionarServicoManutencaoModal
      aberto
      opcoes={[]}
      onAdicionar={onAdicionar}
      onOpenChange={onOpenChange}
    />,
  );
  expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
  act(() => mocks.confirmar!());
  expect(onAdicionar).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalled();
});

it.each(["Serviço antigo", undefined])(
  "preserva serviço fora do catálogo e seu nome: %s",
  async (nome) => {
    const onAdicionar = vi.fn();
    render(
      <AdicionarServicoManutencaoModal
        aberto
        exibirGaleria
        opcoes={[]}
        servicoInicial={{ ...inicial, nome_servico: nome }}
        onAdicionar={onAdicionar}
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: nome ?? "legado" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(onAdicionar).toHaveBeenCalledWith(
      expect.objectContaining({
        servico: "legado",
        nome_servico: nome,
        arquivosExistentes: inicial.arquivosExistentes,
      }),
    );
  },
);

it("não reaproveita o nome anterior ao trocar um serviço legado por Outros", async () => {
  const onAdicionar = vi.fn();
  render(
    <AdicionarServicoManutencaoModal
      aberto
      exibirGaleria
      opcoes={[]}
      servicoInicial={inicial}
      onAdicionar={onAdicionar}
      onOpenChange={vi.fn()}
    />,
  );
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
  fireEvent.click(await screen.findByRole("option", { name: "Outros" }));
  fireEvent.change(screen.getByLabelText("Nome do serviço específico"), {
    target: { value: "Vidraçaria" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
  expect(onAdicionar).toHaveBeenCalledWith(
    expect.objectContaining({
      servico: "outros",
      nome_servico: undefined,
      servico_especifico: "Vidraçaria",
    }),
  );
});

it("remove anexo existente sem nome usando o rótulo alternativo", () => {
  render(
    <AdicionarServicoManutencaoModal
      aberto
      exibirGaleria
      opcoes={[]}
      servicoInicial={inicial}
      onAdicionar={vi.fn()}
      onOpenChange={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Remover arquivo Anexo 1" }));
  expect(screen.queryByRole("list", { name: "Arquivos existentes" })).not.toBeInTheDocument();
  expect(
    screen.getByText("Adicione pelo menos um arquivo do local do reparo."),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
});

it("aciona download e exibe progresso e erro informados pela galeria", () => {
  const props = {
    aberto: true,
    exibirGaleria: true,
    opcoes: [],
    servicoInicial: inicial,
    onAdicionar: vi.fn(),
    onOpenChange: vi.fn(),
  };
  const { rerender } = render(<AdicionarServicoManutencaoModal {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Baixar imagem" }));
  expect(mocks.galeria.baixar).toHaveBeenCalledOnce();
  mocks.galeria.baixando = true;
  rerender(<AdicionarServicoManutencaoModal {...props} />);
  expect(screen.getByRole("button", { name: "Baixando..." })).toBeDisabled();
  mocks.galeria.baixando = false;
  mocks.galeria.erro = "Falha ao baixar a imagem";
  rerender(<AdicionarServicoManutencaoModal {...props} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Falha ao baixar a imagem");
  expect(screen.getByRole("button", { name: "Baixar imagem" })).toBeEnabled();
});

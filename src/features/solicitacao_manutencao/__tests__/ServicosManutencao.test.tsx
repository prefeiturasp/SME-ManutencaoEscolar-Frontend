import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServicosManutencao } from "../components/form/ServicosManutencao";
import type { ServicoManutencao } from "../types/solicitacaoManutencao.types";
import type { ComponentProps } from "react";
import type { AdicionarServicoManutencaoModal } from "../components/form/AdicionarServicoManutencaoModal";

const consulta = vi.hoisted(() => ({
  data: undefined as { value: string; label: string }[] | undefined,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
}));
vi.mock("@/features/servico/hooks/useOpcoesServicos", () => ({
  useOpcoesServicos: () => consulta,
}));
vi.mock("../components/form/AdicionarServicoManutencaoModal", () => ({
  AdicionarServicoManutencaoModal: ({
    onAdicionar,
    onOpenChange,
    servicoInicial,
  }: ComponentProps<typeof AdicionarServicoManutencaoModal>) => (
    <div role="dialog">
      <button
        onClick={() => {
          onAdicionar({
            ...(servicoInicial ?? { id: "novo", servico: "s1", arquivos: [], descricao: "Reparo" }),
            local_reparo: "Novo local",
          });
          onOpenChange(false);
        }}
      >
        Confirmar serviço
      </button>
      <button onClick={() => onOpenChange(false)}>Cancelar modal</button>
    </div>
  ),
}));
const itens: ServicoManutencao[] = [
  { id: "1", servico: "s1", local_reparo: "Sala", descricao: "Reparo", arquivos: [] },
  {
    id: "2",
    servico: "outros",
    servico_especifico: "Serralheria",
    local_reparo: "Portão",
    descricao: "Reparo",
    arquivos: [],
  },
  { id: "3", servico: "sem-opcao", local_reparo: "Pátio", descricao: "Reparo", arquivos: [] },
];
describe("ServicosManutencao", () => {
  beforeEach(() => {
    consulta.data = undefined;
    consulta.isPending = false;
    consulta.isError = false;
    vi.clearAllMocks();
  });
  it("mostra carregamento, falha com nova tentativa e permite Outros", () => {
    consulta.isPending = true;
    const { rerender } = render(<ServicosManutencao />);
    expect(screen.getByText("Carregando serviços...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
    consulta.isPending = false;
    consulta.isError = true;
    rerender(<ServicosManutencao />);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(consulta.refetch).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("adiciona serviços no estado interno sem callbacks obrigatórios", () => {
    render(<ServicosManutencao />);
    expect(screen.getByText("Nenhum serviço ativo disponível.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar serviço" }));
    expect(screen.getByText("Novo local")).toBeInTheDocument();
  });
  it("lista nomes, mantém os outros itens ao editar e remove por id", () => {
    consulta.data = [{ value: "s1", label: "Pintura" }];
    const onChange = vi.fn();
    render(<ServicosManutencao valor={itens} onChange={onChange} />);
    expect(screen.getByText("Pintura")).toBeInTheDocument();
    expect(screen.getByText("Serralheria")).toBeInTheDocument();
    expect(screen.getByText("sem-opcao")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Editar serviço de Sala" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar serviço" }));
    expect(onChange).toHaveBeenLastCalledWith([
      { ...itens[0], local_reparo: "Novo local" },
      itens[1],
      itens[2],
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Remover serviço de Portão" }));
    expect(onChange).toHaveBeenLastCalledWith([itens[0], itens[2]]);
  });
});

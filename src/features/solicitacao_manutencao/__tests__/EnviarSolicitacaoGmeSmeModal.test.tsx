import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { EnviarSolicitacaoGmeSmeModal } from "../components/form/EnviarSolicitacaoGmeSmeModal";
import type { EnviarSolicitacaoGmeSmeResultado } from "../types/analiseDre.types";

const mocks = vi.hoisted(() => ({ enviar: vi.fn(), fechar: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../hooks/useEnviarSolicitacaoGmeSme", () => ({
  useEnviarSolicitacaoGmeSme: () => ({ mutateAsync: mocks.enviar, isPending: false }),
}));
vi.mock("@/components/ui/confirmaDialogo", () => ({
  ConfirmDialog: ({
    description,
    onConfirm,
    onOpenChange,
  }: {
    description: ReactNode;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div>
      {description}
      <button type="button" onClick={onConfirm}>
        Confirmar teste
      </button>
      <button type="button" onClick={() => onOpenChange(true)}>
        Abrir teste
      </button>
      <button type="button" onClick={() => onOpenChange(false)}>
        Fechar teste
      </button>
    </div>
  ),
}));

beforeEach(() => vi.clearAllMocks());

function preparar() {
  render(
    <EnviarSolicitacaoGmeSmeModal
      uuid="sol1"
      decisao="aprovada"
      dataAlteracao="data"
      onFechar={mocks.fechar}
    />,
  );
}

it("usa o título do erro quando a mensagem está vazia", async () => {
  mocks.enviar.mockResolvedValue({
    success: false,
    error: "api-error",
    title: "Erro do backend",
    message: "",
  });
  preparar();
  await userEvent.type(screen.getByLabelText("Observações"), "Análise concluída");
  await userEvent.click(screen.getByRole("button", { name: "Confirmar teste" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Erro do backend");
});

it("ignora confirmação duplicada e mudança de abertura enquanto envia", async () => {
  let concluir!: (resultado: EnviarSolicitacaoGmeSmeResultado) => void;
  mocks.enviar.mockReturnValue(
    new Promise<EnviarSolicitacaoGmeSmeResultado>((resolve) => {
      concluir = resolve;
    }),
  );
  preparar();
  await userEvent.type(screen.getByLabelText("Observações"), "Análise concluída");
  fireEvent.click(screen.getByRole("button", { name: "Abrir teste" }));
  expect(mocks.fechar).not.toHaveBeenCalled();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Confirmar teste" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar teste" }));
  });
  await waitFor(() => expect(mocks.enviar).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Fechar teste" }));
  expect(mocks.fechar).not.toHaveBeenCalled();
  await act(async () =>
    concluir({ success: false, error: "api-error", title: "Erro", message: "Falha" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Fechar teste" }));
  expect(mocks.fechar).toHaveBeenCalledTimes(1);
});

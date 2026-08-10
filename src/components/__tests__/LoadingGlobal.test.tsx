import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LoadingGlobal } from "../shared/LoadingGlobal/LoadingGlobal";
import { ATRASO_PARA_EXIBIR_LOADING_MS } from "../shared/LoadingGlobal/useLoadingComAtraso";

const mocks = vi.hoisted(() => ({
  useMutationState: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutationState: mocks.useMutationState,
}));

vi.mock("@/components/icons/LoadingSpinner", () => ({
  LoadingSpinner: ({ className }: { className?: string }) => (
    <span data-testid="loading-spinner" className={className}>
      Carregando
    </span>
  ),
}));

type OpcoesUseMutationState = {
  select: (mutation: {
    options: {
      meta?: unknown;
    };
  }) => unknown;
};

function configurarMetasDasMutations(metas: unknown[]) {
  mocks.useMutationState.mockImplementation(
    ({ select }: OpcoesUseMutationState) =>
      metas.map((meta) =>
        select({
          options: {
            meta,
          },
        }),
      ),
  );
}

describe("LoadingGlobal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarMetasDasMutations([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não deve renderizar quando não existir loading manual ou de mutation", () => {
    configurarMetasDasMutations([undefined, {}]);

    const { container } = render(<LoadingGlobal />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    expect(mocks.useMutationState).toHaveBeenCalledWith({
      filters: {
        status: "pending",
      },
      select: expect.any(Function),
    });
  });

  it("não deve renderizar o loading da mutation antes do atraso configurado (evita flash em respostas rápidas)", () => {
    vi.useFakeTimers();

    configurarMetasDasMutations([
      {
        loading: {
          titulo: "Salvando serviço",
          mensagem: "Aguarde enquanto salvamos os dados.",
        },
      },
    ]);

    render(<LoadingGlobal />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(ATRASO_PARA_EXIBIR_LOADING_MS - 1);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("deve renderizar em overlay o último loading válido das mutations após o atraso configurado", () => {
    vi.useFakeTimers();

    configurarMetasDasMutations([
      {
        loading: {
          titulo: "Loading anterior",
          mensagem: "Mensagem anterior",
        },
      },
      {
        loading: {
          titulo: "Salvando serviço",
          mensagem: "Aguarde enquanto salvamos os dados.",
        },
      },
      undefined,
    ]);

    render(<LoadingGlobal />);

    act(() => {
      vi.advanceTimersByTime(ATRASO_PARA_EXIBIR_LOADING_MS);
    });

    const status = screen.getByRole("status", {
      name: "Aguarde enquanto salvamos os dados.",
    });

    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");

    expect(screen.getByText("Salvando serviço")).toBeInTheDocument();
    expect(
      screen.getByText("Aguarde enquanto salvamos os dados."),
    ).toBeInTheDocument();

    expect(screen.queryByText("Loading anterior")).not.toBeInTheDocument();

    expect(screen.getByTestId("loading-spinner")).toHaveClass("mb-5");

    expect(status).toHaveClass("w-[352px]", "bg-background", "shadow-lg");

    expect(status.parentElement).toHaveClass(
      "fixed",
      "inset-0",
      "z-[9999]",
      "bg-black/40",
    );
  });

  it("deve renderizar o loading manual no lugar do loading da mutation", () => {
    configurarMetasDasMutations([
      {
        loading: {
          titulo: "Loading da mutation",
          mensagem: "Mensagem da mutation",
        },
      },
    ]);

    render(
      <LoadingGlobal
        exibir
        titulo="Loading manual"
        mensagem="Mensagem manual"
      />,
    );

    expect(
      screen.getByRole("status", { name: "Mensagem manual" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Loading manual")).toBeInTheDocument();
    expect(screen.getByText("Mensagem manual")).toBeInTheDocument();

    expect(screen.queryByText("Loading da mutation")).not.toBeInTheDocument();
    expect(screen.queryByText("Mensagem da mutation")).not.toBeInTheDocument();
  });

  it("deve renderizar o loading local sem criar o overlay", () => {
    render(
      <LoadingGlobal
        exibir
        local
        titulo="Carregando serviços"
        mensagem="Buscando serviços cadastrados."
      />,
    );

    const status = screen.getByRole("status", {
      name: "Buscando serviços cadastrados.",
    });

    expect(status).toHaveClass("w-full", "text-blocked-foreground");

    expect(status).not.toHaveClass("w-[352px]", "bg-background", "shadow-lg");

    expect(status.parentElement).not.toHaveClass(
      "fixed",
      "inset-0",
      "bg-black/40",
    );

    expect(screen.getByText("Carregando serviços")).toBeInTheDocument();
    expect(
      screen.getByText("Buscando serviços cadastrados."),
    ).toBeInTheDocument();
  });

  it("deve aceitar loading manual sem título e mensagem", () => {
    render(<LoadingGlobal exibir />);

    const status = screen.getByRole("status");

    expect(status).toBeInTheDocument();
    expect(status).not.toHaveAttribute("aria-label");
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});

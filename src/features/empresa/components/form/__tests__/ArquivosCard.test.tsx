import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArquivosCard } from "../ArquivosCard";
import type { Anexo } from "@/features/empresa/types/anexo.type";

const { toastErroMock } = vi.hoisted(() => ({ toastErroMock: vi.fn() }));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: toastErroMock,
}));

describe("ArquivosCard", () => {
  it("deve retornar null quando não há anexos", () => {
    const { container } = render(
      <ArquivosCard anexos={[]} onRemover={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("deve renderizar cards de arquivos quando há anexos", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
      {
        uuid: "2",
        nome: "ART.pdf",
        anexado_por: "Maria Silva",
        anexado_em: "2025-05-07T10:30:00",
      },
    ];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    expect(screen.getByText("CREA.pdf")).toBeInTheDocument();
    expect(screen.getByText("ART.pdf")).toBeInTheDocument();
  });

  it("deve exibir informações de anexação quando disponíveis", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
    ];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    expect(
      screen.getByText(/Anexado por: Gabriel Gomes de Alonso/),
    ).toBeInTheDocument();
  });

  it("deve chamar onRemover quando botão de excluir é clicado", async () => {
    const onRemover = vi.fn();
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
    ];

    const user = userEvent.setup();
    render(<ArquivosCard anexos={anexos} onRemover={onRemover} />);

    const botaoExcluir = screen.getByRole("button", {
      name: /remover arquivo/i,
    });
    await user.click(botaoExcluir);

    expect(onRemover).toHaveBeenCalledWith(0);
  });

  it("deve renderizar link de download sem abrir uma nova guia", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        arquivo_url: "https://example.com/crea.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
    ];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    const link = screen.getByRole("link", {
      name: "Baixar arquivo CREA.pdf",
    });
    expect(link).toHaveAttribute("href", "https://example.com/crea.pdf");
    expect(link).toHaveAttribute("download", "CREA.pdf");
    expect(link).not.toHaveAttribute("target");
  });

  it("deve renderizar botão para baixar arquivo salvo", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        arquivo_url: "https://example.com/crea.pdf",
      },
    ];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    const botaoBaixar = screen.getByRole("link", {
      name: "Baixar arquivo CREA.pdf",
    });
    expect(botaoBaixar).toHaveAttribute("href", "https://example.com/crea.pdf");
    expect(botaoBaixar).toHaveAttribute("download", "CREA.pdf");
    expect(botaoBaixar).toHaveTextContent("Baixar arquivo");
  });

  it("deve baixar o arquivo como blob sem navegar para a URL", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const blob = new Blob(["arquivo"], { type: "application/pdf" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(blob),
    });
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:arquivo");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ArquivosCard
        anexos={[
          {
            nome: "CREA.pdf",
            arquivo_url: "https://example.com/crea.pdf",
          },
        ]}
        onRemover={() => {}}
      />,
    );

    await user.click(
      screen.getByRole("link", { name: "Baixar arquivo CREA.pdf" }),
    );

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/crea.pdf", {
      credentials: "include",
    });
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    await act(async () => vi.runAllTimers());
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:arquivo");

    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("não deve iniciar o download quando a URL do anexo está vazia", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ArquivosCard
        anexos={[{ nome: "CREA.pdf", arquivo_url: "" }]}
        onRemover={() => {}}
      />,
    );

    expect(screen.queryByRole("link", { name: /baixar arquivo/i })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("deve avisar quando o servidor rejeita o download", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );

    render(
      <ArquivosCard
        anexos={[
          { nome: "CREA.pdf", arquivo_url: "https://example.com/crea.pdf" },
        ]}
        onRemover={() => {}}
      />,
    );
    await user.click(
      screen.getByRole("link", { name: "Baixar arquivo CREA.pdf" }),
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro ao baixar arquivo",
      descricao: "Não foi possível baixar o arquivo. Tente novamente.",
    });
    vi.unstubAllGlobals();
  });

  it("não deve renderizar botão para baixar arquivo sem arquivo_url", () => {
    const anexos: Anexo[] = [{ nome: "CREA.pdf" }];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    expect(
      screen.queryByRole("link", { name: /baixar arquivo/i }),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar o botão de remover para todo arquivo", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
    ];

    render(<ArquivosCard anexos={anexos} onRemover={() => {}} />);

    expect(
      screen.getByRole("button", { name: /remover arquivo/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar múltiplos cards em grid responsivo", () => {
    const anexos: Anexo[] = [
      {
        uuid: "1",
        nome: "CREA.pdf",
        anexado_por: "Gabriel Gomes de Alonso",
        anexado_em: "2025-05-06T15:45:00",
      },
      {
        uuid: "2",
        nome: "ART.pdf",
        anexado_por: "Maria Silva",
        anexado_em: "2025-05-07T10:30:00",
      },
      {
        uuid: "3",
        nome: "Comprovante.pdf",
        anexado_por: "João Pereira",
        anexado_em: "2025-05-08T14:15:00",
      },
    ];

    const { container } = render(
      <ArquivosCard anexos={anexos} onRemover={() => {}} />,
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
  });
});

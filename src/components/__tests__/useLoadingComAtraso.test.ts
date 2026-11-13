import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLoadingComAtraso } from "../shared/LoadingGlobal/useLoadingComAtraso";

describe("useLoadingComAtraso", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("não exibe o conteúdo antes do atraso configurado", () => {
    const { result, rerender } = renderHook(
      ({ conteudo }: { conteudo: string | null }) =>
        useLoadingComAtraso(conteudo, 1000),
      { initialProps: { conteudo: null as string | null } },
    );

    rerender({ conteudo: "carregando" });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("carregando");
  });

  it("não exibe nada se o conteúdo sumir antes do atraso (resposta rápida)", () => {
    const { result, rerender } = renderHook(
      ({ conteudo }: { conteudo: string | null }) =>
        useLoadingComAtraso(conteudo, 1000),
      { initialProps: { conteudo: null as string | null } },
    );

    rerender({ conteudo: "carregando" });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    rerender({ conteudo: null });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBeNull();
  });

  it("esconde imediatamente quando o conteúdo some após já ter sido exibido", () => {
    const { result, rerender } = renderHook(
      ({ conteudo }: { conteudo: string | null }) =>
        useLoadingComAtraso(conteudo, 1000),
      { initialProps: { conteudo: null as string | null } },
    );

    rerender({ conteudo: "carregando" });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("carregando");

    rerender({ conteudo: null });
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBeNull();
  });
});

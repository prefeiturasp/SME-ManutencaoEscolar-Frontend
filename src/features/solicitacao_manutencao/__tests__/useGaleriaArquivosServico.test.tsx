import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGaleriaArquivosServico } from "../hooks/useGaleriaArquivosServico";

const semArquivos: File[] = [];

describe("useGaleriaArquivosServico", () => {
  const criarUrl = vi.fn(() => "blob:imagem");
  const revogarUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = criarUrl;
        static revokeObjectURL = revogarUrl;
      },
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("não gera prévias quando a galeria está desabilitada", () => {
    const { result } = renderHook(() =>
      useGaleriaArquivosServico([new File(["a"], "a.jpg")], [], false),
    );
    expect(result.current.previas).toEqual([]);
    expect(criarUrl).not.toHaveBeenCalled();
  });

  it("gera, atualiza e libera prévias, limitando o índice após remoções", async () => {
    const foto = new File(["a"], "nova.jpg");
    const existentes = [{ uuid: "a1", arquivo: "/existente.jpg" }];
    const { result, rerender, unmount } = renderHook(
      ({ arquivos }) => useGaleriaArquivosServico(arquivos, existentes, true),
      { initialProps: { arquivos: [foto] } },
    );
    await waitFor(() => expect(result.current.previas).toHaveLength(2));
    expect(result.current.previas[1]).toEqual({ arquivo: "blob:imagem", nome: "nova.jpg" });
    act(() => result.current.setIndice(1));
    expect(result.current.indiceAtual).toBe(1);
    rerender({ arquivos: [] });
    await waitFor(() => expect(result.current.previas).toHaveLength(1));
    expect(result.current.indiceAtual).toBe(0);
    expect(revogarUrl).toHaveBeenCalledWith("blob:imagem");
    unmount();
  });

  it("não atualiza prévias depois de desmontar antes da resolução", async () => {
    const { unmount } = renderHook(() =>
      useGaleriaArquivosServico([new File(["a"], "a.jpg")], [], true),
    );
    unmount();
    await act(async () => {
      await Promise.resolve();
    });
    expect(revogarUrl).toHaveBeenCalledWith("blob:imagem");
  });

  it.each([undefined, "//outro-host/foto.jpg", "javascript:alert(1)"])(
    "não baixa quando não há arquivo permitido: %s",
    async (arquivo) => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      const existentes = arquivo ? [{ uuid: "a1", arquivo }] : [];
      const { result } = renderHook(() =>
        useGaleriaArquivosServico(semArquivos, existentes, false),
      );
      expect(result.current.podeBaixar).toBe(false);
      await act(async () => {
        await result.current.baixar();
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(result.current.baixando).toBe(false);
    },
  );

  it.each([
    { nome_original: " original.jpg ", esperado: "original.jpg" },
    { nome_original: " ", nome: "alternativa.jpg", esperado: "alternativa.jpg" },
    { esperado: "imagem" },
  ])("baixa imagem usando o nome $esperado", async ({ esperado, ...nomes }) => {
    const blob = new Blob(["foto"], { type: "image/jpeg" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, blob: async () => blob }));
    const clicar = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe(esperado);
      expect(this.href).toBe("blob:imagem");
      expect(document.body.contains(this)).toBe(true);
    });
    const existentes = [{ uuid: "a1", arquivo: "/foto.jpg", ...nomes }];
    const { result } = renderHook(() => useGaleriaArquivosServico(semArquivos, existentes, false));
    await act(async () => {
      await result.current.baixar();
    });
    expect(clicar).toHaveBeenCalledOnce();
    expect(document.querySelector("a[download]")).toBeNull();
    expect(criarUrl).toHaveBeenCalledWith(blob);
    expect(revogarUrl).toHaveBeenCalledWith("blob:imagem");
    expect(result.current.erro).toBe("");
    expect(result.current.baixando).toBe(false);
  });

  it.each(["http", "rede"])("informa erro %s e limpa o erro na nova tentativa", async (tipo) => {
    let concluir!: (resposta: unknown) => void;
    const fetchMock = vi.fn();
    if (tipo === "http") fetchMock.mockResolvedValueOnce({ ok: false });
    else fetchMock.mockRejectedValueOnce(new Error("Sem conexão"));
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          concluir = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const existentes = [{ uuid: "a1", arquivo: "https://exemplo.com/foto.jpg" }];
    const { result } = renderHook(() => useGaleriaArquivosServico(semArquivos, existentes, false));
    await act(async () => {
      await result.current.baixar();
    });
    expect(result.current.erro).toBe("Não foi possível baixar a imagem. Tente novamente.");
    let download!: Promise<void>;
    act(() => {
      download = result.current.baixar();
    });
    expect(result.current.baixando).toBe(true);
    expect(result.current.erro).toBe("");
    await act(async () => {
      concluir({ ok: true, blob: async () => new Blob(["foto"]) });
      await download;
    });
    expect(result.current.baixando).toBe(false);
  });
});

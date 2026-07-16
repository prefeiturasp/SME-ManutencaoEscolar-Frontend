import { isValidElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import RootLayout, { metadata } from "@/app/layout";

vi.mock("next/font/google", () => ({
  Roboto: () => ({
    variable: "roboto",
  }),
  Geist_Mono: () => ({
    variable: "geist-mono",
  }),
}));

describe("RootLayout", () => {
  it("deve renderizar o html com lang pt-BR", () => {
    const layout = RootLayout({
      children: <div>Olá Mundo</div>,
    });

    expect(isValidElement(layout)).toBe(true);
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("pt-BR");
  });

  it("deve renderizar os children dentro do body", () => {
    const layout = RootLayout({
      children: <div>Olá Mundo</div>,
    });

    const body = layout.props.children as ReactElement<{
      children: React.ReactNode;
    }>;

    expect(body.type).toBe("body");
    expect(body.props.children).toEqual(<div>Olá Mundo</div>);
  });

  it("deve exportar os metadados corretamente", () => {
    expect(metadata.title).toBe("Manutenção Escolar");
    expect(metadata.description).toBeDefined();
  });
});

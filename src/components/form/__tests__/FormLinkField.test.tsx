import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  registerMock,
  clearErrorsMock,
  fieldOnChangeMock,
  fieldOnBlurMock,
  fieldRefMock,
  useFormContextMock,
  useWatchMock,
  writeTextMock,
  windowOpenMock,
  copyOnClickMock,
  abrirOnClickMock,
} = vi.hoisted(() => ({
  registerMock: vi.fn(),
  clearErrorsMock: vi.fn(),
  fieldOnChangeMock: vi.fn(),
  fieldOnBlurMock: vi.fn(),
  fieldRefMock: vi.fn(),
  useFormContextMock: vi.fn(),
  useWatchMock: vi.fn(),
  writeTextMock: vi.fn(),
  windowOpenMock: vi.fn(),
  copyOnClickMock: vi.fn(),
  abrirOnClickMock: vi.fn(),
}));

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useFormContext: useFormContextMock,
    useWatch: useWatchMock,
  };
});

vi.mock("lucide-react", () => ({
  Copy: (props: { className?: string }) => (
    <svg data-testid="copy-icon" {...props} />
  ),
  Info: (props: { className?: string }) => (
    <svg data-testid="info-icon" {...props} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement>) => {
    if (props["aria-label"] === "Copiar link") {
      copyOnClickMock.mockImplementation(() => {
        onClick?.({} as Parameters<NonNullable<typeof onClick>>[0]);
      });
    }

    if (children === "Abrir link") {
      abrirOnClickMock.mockImplementation(() => {
        onClick?.({} as Parameters<NonNullable<typeof onClick>>[0]);
      });
    }

    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: {
    children: ReactNode;
    htmlFor?: string;
  }) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({
    children,
  }: {
    children: ReactNode;
    asChild?: boolean;
  }) => <div>{children}</div>,
  TooltipContent: ({
    children,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div>{children}</div>,
}));

import { FormLinkField } from "../FormLinkField";

interface TestForm {
  link_rastreio: string;
}

function configurarFormulario({
  errors = {},
  watchValue = "",
}: {
  errors?: Record<string, unknown>;
  watchValue?: string;
} = {}) {
  registerMock.mockReturnValue({
    name: "link_rastreio",
    onChange: fieldOnChangeMock,
    onBlur: fieldOnBlurMock,
    ref: fieldRefMock,
  });

  useFormContextMock.mockReturnValue({
    register: registerMock,
    clearErrors: clearErrorsMock,
    formState: { errors },
  });

  useWatchMock.mockReturnValue(watchValue);
}

describe("FormLinkField", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window.navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
      writable: true,
    });

    vi.stubGlobal("open", windowOpenMock);

    configurarFormulario();
  });

  it("deve renderizar label, placeholder padrão e classe padrão", () => {
    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const input = screen.getByRole("textbox", { name: "Link" });

    expect(input).toHaveAttribute("id", "link_rastreio");
    expect(input).toHaveAttribute("name", "link_rastreio");
    expect(input).toHaveAttribute("placeholder", "https://");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input.closest("div.space-y-1")).toBeInTheDocument();

    expect(registerMock).toHaveBeenCalledWith("link_rastreio");
    expect(useWatchMock).toHaveBeenCalledWith({
      name: "link_rastreio",
    });
  });

  it("deve renderizar tooltip quando informado", () => {
    render(
      <FormLinkField<TestForm>
        name="link_rastreio"
        label="Link"
        tooltip="Use um link completo"
      />,
    );

    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    expect(screen.getByText("Use um link completo")).toBeInTheDocument();
  });

  it("deve chamar onChange do campo e clearErrors ao digitar", () => {
    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const input = screen.getByRole("textbox", { name: "Link" });

    fireEvent.change(input, {
      target: {
        value: "https://exemplo.com",
      },
    });

    expect(fieldOnChangeMock).toHaveBeenCalledTimes(1);
    expect(clearErrorsMock).toHaveBeenCalledTimes(1);
    expect(clearErrorsMock).toHaveBeenCalledWith("link_rastreio");
  });

  it("deve copiar link quando houver valor", () => {
    configurarFormulario({
      watchValue: "https://exemplo.com",
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const copiarBotao = screen.getByRole("button", {
      name: "Copiar link",
    });

    fireEvent.click(copiarBotao);

    expect(copiarBotao).toBeEnabled();
    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock).toHaveBeenCalledWith("https://exemplo.com");
  });

  it("deve manter botão de copiar desabilitado sem valor", () => {
    configurarFormulario({
      watchValue: "",
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const copiarBotao = screen.getByRole("button", {
      name: "Copiar link",
    });

    expect(copiarBotao).toBeDisabled();
    expect(writeTextMock).not.toHaveBeenCalled();

    copyOnClickMock();

    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it("deve abrir link e habilitar botão quando URL for http://", () => {
    configurarFormulario({
      watchValue: "http://exemplo.com",
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const abrirBotao = screen.getByRole("button", {
      name: "Abrir link",
    });

    expect(abrirBotao).toBeEnabled();
    expect(abrirBotao).toHaveClass("bg-white");
    expect(abrirBotao).not.toHaveClass(
      "text-gray",
      "border-blocked-foreground",
    );

    fireEvent.click(abrirBotao);

    expect(windowOpenMock).toHaveBeenCalledWith(
      "http://exemplo.com",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("deve manter botão de abrir desabilitado e classe de bloqueio com valor inválido", () => {
    configurarFormulario({
      watchValue: "ftp://exemplo.com",
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    const abrirBotao = screen.getByRole("button", {
      name: "Abrir link",
    });

    expect(abrirBotao).toBeDisabled();
    expect(abrirBotao).toHaveClass(
      "bg-white",
      "text-gray",
      "border-blocked-foreground",
    );

    fireEvent.click(abrirBotao);

    expect(windowOpenMock).not.toHaveBeenCalled();
  });

  it("não deve abrir link quando handler roda com valor vazio", () => {
    configurarFormulario({
      watchValue: "",
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    abrirOnClickMock();

    expect(windowOpenMock).not.toHaveBeenCalled();
  });

  it("deve desabilitar botão de abrir quando valor é undefined", () => {
    configurarFormulario({
      watchValue: undefined as unknown as string,
    });

    render(<FormLinkField<TestForm> name="link_rastreio" label="Link" />);

    expect(
      screen.getByRole("button", {
        name: "Abrir link",
      }),
    ).toBeDisabled();
  });

  it("deve esconder botões quando showButtons for false", () => {
    render(
      <FormLinkField<TestForm>
        name="link_rastreio"
        label="Link"
        showButtons={false}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "Copiar link",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Abrir link",
      }),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar erro e não renderizar helperText quando houver mensagem", () => {
    configurarFormulario({
      errors: {
        link_rastreio: {
          message: "Link inválido",
        },
      },
      watchValue: "https://exemplo.com",
    });

    render(
      <FormLinkField<TestForm>
        name="link_rastreio"
        label="Link"
        helperText="Use http:// ou https://"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Link" });

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Link inválido");
    expect(
      screen.queryByText("Use http:// ou https://"),
    ).not.toBeInTheDocument();
  });

  it("deve renderizar helperText e aceitar className customizada quando não há erro", () => {
    render(
      <FormLinkField<TestForm>
        name="link_rastreio"
        label="Link"
        helperText="Use http:// ou https://"
        className="custom-wrapper"
      />,
    );

    expect(screen.getByText("Use http:// ou https://")).toBeInTheDocument();
    expect(document.querySelector(".custom-wrapper")).toBeInTheDocument();
    expect(document.querySelector(".space-y-1")).not.toBeInTheDocument();
  });
});

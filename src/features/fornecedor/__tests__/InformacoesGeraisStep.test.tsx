import type {
  ButtonHTMLAttributes,
  ComponentProps,
  MouseEventHandler,
  ReactNode,
} from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InformacoesGeraisStep } from "../components/form/InformacoesGeraisStep";
import type { FornecedorSchema } from "../schemas/fornecedor.schema";
import { fornecedorSchema } from "../schemas/fornecedor.schema";

const {
  clipboardWriteTextMock,
  windowOpenMock,
  abrirLinkOnClickMock,
  watchControl,
} = vi.hoisted(() => ({
  clipboardWriteTextMock: vi.fn(),
  windowOpenMock: vi.fn(),
  abrirLinkOnClickMock: vi.fn(),
  watchControl: {
    retornarUndefined: false,
  },
}));

vi.mock("react-hook-form", async (importOriginal) => {
  const original = await importOriginal<typeof import("react-hook-form")>();

  return {
    ...original,
    useFormContext: () => {
      const contexto = original.useFormContext<FornecedorSchema>();

      if (!watchControl.retornarUndefined) {
        return contexto;
      }

      return {
        ...contexto,
        watch: (() => undefined) as unknown as typeof contexto.watch,
      };
    },
  };
});

vi.mock("../../../constants", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../constants/constants")>();

  return {
    ...original,
    ESTADOS: [
      ...original.ESTADOS,
      {
        label: "Estado sem valor",
        value: undefined as unknown as string,
      },
    ],
  };
});

vi.mock("@/components/ui/select", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/components/ui/select")>();

  type SelectItemMockProps = ComponentProps<typeof original.SelectItem>;

  return {
    ...original,
    SelectItem: ({ value, ...props }: SelectItemMockProps) => (
      <original.SelectItem {...props} value={value ?? "__estado_sem_valor__"} />
    ),
  };
});

interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: string;
  readonly size?: string;
  readonly children?: ReactNode;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant: _variant,
    size: _size,
    ...props
  }: ButtonMockProps) => {
    if (children === "Abrir link") {
      abrirLinkOnClickMock.mockImplementation(() => {
        onClick?.({} as Parameters<MouseEventHandler<HTMLButtonElement>>[0]);
      });
    }

    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));

type FormMethods = ReturnType<typeof useForm<FornecedorSchema>>;

interface WrapperProps {
  readonly defaultValues?: Partial<FornecedorSchema>;
  readonly onReady?: (methods: FormMethods) => void;
}

function Wrapper({ defaultValues, onReady }: WrapperProps) {
  const methods = useForm<FornecedorSchema>({
    mode: "onBlur",
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      razao_social: "",
      status: undefined,
      link_rastreio: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: undefined,
      ...defaultValues,
    } as FornecedorSchema,
  });

  onReady?.(methods);

  return (
    <FormProvider {...methods}>
      <InformacoesGeraisStep />
    </FormProvider>
  );
}

function renderStep(defaultValues?: Partial<FornecedorSchema>) {
  return render(<Wrapper defaultValues={defaultValues} />);
}

function renderStepWithMethods(defaultValues?: Partial<FornecedorSchema>) {
  let methods: FormMethods | undefined;

  render(
    <Wrapper
      defaultValues={defaultValues}
      onReady={(formMethods) => {
        methods = formMethods;
      }}
    />,
  );

  if (!methods) {
    throw new Error("Formulário não inicializado");
  }

  return methods;
}

describe("InformacoesGeraisStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    watchControl.retornarUndefined = false;
    clipboardWriteTextMock.mockResolvedValue(undefined);

    Object.defineProperty(window.navigator, "clipboard", {
      value: {
        writeText: clipboardWriteTextMock,
      },
      configurable: true,
      writable: true,
    });

    vi.stubGlobal("open", windowOpenMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deve renderizar os títulos das seções", () => {
    renderStep();

    expect(
      screen.getByRole("heading", {
        name: /dados da empresa/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /localização/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar todos os campos de dados da empresa", () => {
    renderStep();

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/link de rastreio/i)).toBeInTheDocument();
  });

  it("deve renderizar todos os campos de localização", () => {
    renderStep();

    expect(screen.getByLabelText(/^cep$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/logradouro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/complemento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cidade$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^estado$/i)).toBeInTheDocument();
  });

  it("deve renderizar os placeholders", () => {
    renderStep();

    expect(
      screen.getByPlaceholderText("00.000.000/0000-00"),
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("00000-000")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/digite o complemento/i),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher o nome", async () => {
    const user = userEvent.setup();

    renderStep();

    const nomeInput = screen.getByLabelText(/^nome$/i);

    await user.type(nomeInput, "Fornecedor Teste");

    expect(nomeInput).toHaveValue("Fornecedor Teste");
  });

  it("deve aplicar a máscara no CNPJ", async () => {
    const user = userEvent.setup();

    renderStep();

    const cnpjInput = screen.getByLabelText(/^cnpj$/i);

    await user.type(cnpjInput, "12345678000199");

    await waitFor(() => {
      expect(cnpjInput).toHaveValue("12.345.678/0001-99");
    });
  });

  it("deve armazenar o CNPJ sem máscara", async () => {
    const user = userEvent.setup();
    const methods = renderStepWithMethods();

    await user.type(screen.getByLabelText(/^cnpj$/i), "12345678000199");

    await waitFor(() => {
      expect(methods.getValues("cnpj")).toBe("12345678000199");
    });
  });

  it("deve renderizar CNPJ vazio quando o valor é undefined", () => {
    renderStep({
      cnpj: undefined,
    } as unknown as Partial<FornecedorSchema>);

    expect(screen.getByLabelText(/^cnpj$/i)).toHaveValue("");
  });

  it("deve aplicar a máscara no CEP", async () => {
    const user = userEvent.setup();

    renderStep();

    const cepInput = screen.getByLabelText(/^cep$/i);

    await user.type(cepInput, "01310100");

    await waitFor(() => {
      expect(cepInput).toHaveValue("01310-100");
    });
  });

  it("deve armazenar o CEP sem máscara", async () => {
    const user = userEvent.setup();
    const methods = renderStepWithMethods();

    await user.type(screen.getByLabelText(/^cep$/i), "01310100");

    await waitFor(() => {
      expect(methods.getValues("cep")).toBe("01310100");
    });
  });

  it("deve renderizar CEP vazio quando o valor é undefined", () => {
    renderStep({
      cep: undefined,
    } as unknown as Partial<FornecedorSchema>);

    expect(screen.getByLabelText(/^cep$/i)).toHaveValue("");
  });

  it("deve exibir erro obrigatório do CNPJ", async () => {
    const user = userEvent.setup();

    renderStep();

    const cnpjInput = screen.getByLabelText(/^cnpj$/i);

    await user.click(cnpjInput);
    await user.tab();

    expect(await screen.findByText("CNPJ é obrigatório!")).toBeInTheDocument();
  });

  it("deve exibir erro obrigatório do status", async () => {
    const user = userEvent.setup();

    renderStep();

    const statusTrigger = screen.getByRole("combobox", {
      name: /^status$/i,
    });

    await user.click(statusTrigger);
    await user.keyboard("{Escape}");

    expect(
      await screen.findByText("Status é obrigatório!"),
    ).toBeInTheDocument();
  });

  it("deve selecionar o status ativo", async () => {
    const user = userEvent.setup();

    renderStep();

    const statusTrigger = screen.getByRole("combobox", {
      name: /^status$/i,
    });

    await user.click(statusTrigger);

    const ativo = await screen.findByRole("option", {
      name: /^ativo$/i,
    });

    await user.click(ativo);

    expect(statusTrigger).toHaveTextContent(/ativo/i);
  });

  it("deve selecionar o status inativo", async () => {
    const user = userEvent.setup();

    renderStep();

    const statusTrigger = screen.getByRole("combobox", {
      name: /^status$/i,
    });

    await user.click(statusTrigger);

    const inativo = await screen.findByRole("option", {
      name: /^inativo$/i,
    });

    await user.click(inativo);

    expect(statusTrigger).toHaveTextContent(/inativo/i);
  });

  it("deve renderizar status com valor definido", () => {
    renderStep({
      status: false,
    });

    expect(
      screen.getByRole("combobox", {
        name: /^status$/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve executar o onBlur do status", () => {
    renderStep({
      status: true,
    });

    const statusTrigger = screen.getByRole("combobox", {
      name: /^status$/i,
    });

    fireEvent.blur(statusTrigger);

    expect(statusTrigger).toBeInTheDocument();
  });

  it("deve renderizar a mensagem auxiliar do link", () => {
    renderStep();

    expect(
      screen.getByText(/o endereço deve começar com/i),
    ).toBeInTheDocument();
  });

  it("deve renderizar o ícone de informação", () => {
    renderStep();

    expect(document.querySelector("svg.lucide-info")).toBeInTheDocument();
  });

  it("deve desabilitar abrir link quando o valor está vazio", () => {
    renderStep({
      link_rastreio: "",
    });

    expect(
      screen.getByRole("button", {
        name: /abrir link/i,
      }),
    ).toBeDisabled();
  });

  it("deve habilitar abrir link quando existe um valor", () => {
    renderStep({
      link_rastreio: "https://exemplo.com/rastreio",
    });

    expect(
      screen.getByRole("button", {
        name: /abrir link/i,
      }),
    ).toBeEnabled();
  });

  it("deve abrir o link em uma nova aba", async () => {
    const user = userEvent.setup();

    renderStep({
      link_rastreio: "https://exemplo.com/rastreio",
    });

    await user.click(
      screen.getByRole("button", {
        name: /abrir link/i,
      }),
    );

    expect(windowOpenMock).toHaveBeenCalledWith(
      "https://exemplo.com/rastreio",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("não deve abrir quando o link está vazio", () => {
    renderStep({
      link_rastreio: "",
    });

    abrirLinkOnClickMock();

    expect(windowOpenMock).not.toHaveBeenCalled();
  });

  it("deve copiar o link de rastreio", () => {
    renderStep({
      link_rastreio: "https://exemplo.com/rastreio",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /copiar link/i,
      }),
    );

    expect(clipboardWriteTextMock).toHaveBeenCalledWith(
      "https://exemplo.com/rastreio",
    );
  });

  it("Não deve copiar quando o link está vazio", () => {
    renderStep({ link_rastreio: "" });

    const copyButton = screen.getByRole("button", { name: /copiar link/i });
    expect(copyButton).toBeDisabled();
    fireEvent.click(copyButton);

    expect(clipboardWriteTextMock).not.toHaveBeenCalled();
  });

  it("deve exibir os erros dos campos", async () => {
    const methods = renderStepWithMethods();

    act(() => {
      methods.setError("cnpj", {
        type: "manual",
        message: "CNPJ inválido!",
      });

      methods.setError("status", {
        type: "manual",
        message: "Status inválido!",
      });

      methods.setError("link_rastreio", {
        type: "manual",
        message: "Link inválido!",
      });

      methods.setError("cep", {
        type: "manual",
        message: "CEP inválido!",
      });

      methods.setError("estado", {
        type: "manual",
        message: "Estado inválido!",
      });
    });

    expect(await screen.findByText("CNPJ inválido!")).toBeInTheDocument();

    expect(screen.getByText("Status inválido!")).toBeInTheDocument();
    expect(screen.getByText("Link inválido!")).toBeInTheDocument();
    expect(screen.getByText("CEP inválido!")).toBeInTheDocument();
    expect(screen.getByText("Estado inválido!")).toBeInTheDocument();

    expect(
      screen.queryByText(/o endereço deve começar com/i),
    ).not.toBeInTheDocument();
  });

  it("deve selecionar um estado", async () => {
    const user = userEvent.setup();

    renderStep();

    const estadoTrigger = screen.getByRole("combobox", {
      name: /^estado$/i,
    });

    await user.click(estadoTrigger);

    const options = await screen.findAllByRole("option");

    expect(options.length).toBeGreaterThan(0);

    const option =
      options.find((item) => item.textContent?.trim() !== "") ?? options[0];

    await user.click(option);

    expect(estadoTrigger).toHaveTextContent(option.textContent ?? "");
  });

  it("deve fechar o select de estado", async () => {
    const user = userEvent.setup();

    renderStep();

    const estadoTrigger = screen.getByRole("combobox", {
      name: /^estado$/i,
    });

    await user.click(estadoTrigger);
    await user.keyboard("{Escape}");

    expect(estadoTrigger).toBeInTheDocument();
  });

  it("deve executar o onBlur do estado", () => {
    renderStep({
      estado: "SP",
    });

    const estadoTrigger = screen.getByRole("combobox", {
      name: /^estado$/i,
    });

    fireEvent.blur(estadoTrigger);

    expect(estadoTrigger).toBeInTheDocument();
  });

  it("deve renderizar estado com valor definido", () => {
    renderStep({
      estado: "SP",
    });

    expect(
      screen.getByRole("combobox", {
        name: /^estado$/i,
      }),
    ).toBeInTheDocument();
  });
});

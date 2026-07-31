import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fornecedorSchema,
  type FornecedorSchema,
} from "../schemas/fornecedor.schema";
import { InformacoesGeraisStep } from "../components/InformacoesGeraisStep";

type FormMethods = ReturnType<typeof useForm<FornecedorSchema>>;

function Wrapper({
  defaultValues,
  onErrors,
  onReady,
}: {
  defaultValues?: Partial<FornecedorSchema>;
  onErrors?: (errors: unknown) => void;
  onReady?: (methods: FormMethods) => void;
}) {
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

  if (onErrors) {
    onErrors(methods.formState.errors);
  }

  if (onReady) {
    onReady(methods);
  }

  return (
    <FormProvider {...methods}>
      <InformacoesGeraisStep />
    </FormProvider>
  );
}

function renderStep(defaultValues?: Partial<FornecedorSchema>) {
  return render(<Wrapper defaultValues={defaultValues} />);
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const clipboardWriteText = vi.fn();
const windowOpen = vi.fn();

beforeEach(() => {
  clipboardWriteText.mockReset();
  clipboardWriteText.mockResolvedValue(undefined);
  windowOpen.mockClear();

  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText: clipboardWriteText },
    configurable: true,
    writable: true,
  });
  vi.stubGlobal("open", windowOpen);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("InformacoesGeraisStep", () => {
  it("renders section headings", () => {
    renderStep();

    expect(
      screen.getByRole("heading", { name: /dados da empresa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /localização/i }),
    ).toBeInTheDocument();
  });

  it("renders all company data fields", () => {
    renderStep();

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/link de rastreio/i)).toBeInTheDocument();
  });

  it("renders all location fields", () => {
    renderStep();

    expect(screen.getByLabelText(/^cep$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/logradouro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/complemento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cidade$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^estado$/i)).toBeInTheDocument();
  });

  it("masks the CNPJ input as the user types", async () => {
    const user = userEvent.setup();
    renderStep();

    const cnpjInput = screen.getByLabelText(/^cnpj$/i) as HTMLInputElement;
    await user.type(cnpjInput, "12345678000199");

    await waitFor(() => {
      expect(cnpjInput.value).toBe("12.345.678/0001-99");
    });
  });

  it("shows the required CNPJ validation message when the field loses focus empty", async () => {
    const user = userEvent.setup();
    renderStep();

    const cnpjInput = screen.getByLabelText(/^cnpj$/i);
    await user.click(cnpjInput);
    await user.tab();

    expect(await screen.findByText("CNPJ é obrigatório!")).toBeInTheDocument();
  });

  it("shows the required status validation message when the field is dismissed empty", async () => {
    const user = userEvent.setup();
    renderStep();

    const statusTrigger = screen.getByRole("combobox", { name: /^status$/i });
    await user.click(statusTrigger);
    await user.keyboard("{Escape}");

    expect(
      await screen.findByText("Status é obrigatório!"),
    ).toBeInTheDocument();
  });

  it("masks the CEP input as the user types", async () => {
    const user = userEvent.setup();
    renderStep();

    const cepInput = screen.getByLabelText(/^cep$/i) as HTMLInputElement;
    await user.type(cepInput, "01310100");

    await waitFor(() => {
      expect(cepInput.value).toBe("01310-100");
    });
  });

  it("allows free text entry in the nome field", async () => {
    const user = userEvent.setup();
    renderStep();

    const nomeInput = screen.getByLabelText(/^nome$/i) as HTMLInputElement;
    await user.type(nomeInput, "Fornecedor Teste");

    expect(nomeInput.value).toBe("Fornecedor Teste");
  });

  it("shows a helper hint for the link de rastreio field when there is no error", () => {
    renderStep();

    expect(
      screen.getByText(/o endereço deve começar com/i),
    ).toBeInTheDocument();
  });

  it("displays a tooltip icon next to the link de rastreio label", () => {
    renderStep();

    const label = screen.getByText(/link de rastreio/i);
    expect(label).toBeInTheDocument();
    // Info icon renders as an svg sibling next to the label
    expect(document.querySelector("svg.lucide-info")).toBeTruthy();
  });

  it('disables the "Abrir link" button when link_rastreio is empty', () => {
    renderStep({ link_rastreio: "" });

    const openLinkButton = screen.getByRole("button", { name: /abrir link/i });
    expect(openLinkButton).toBeDisabled();
  });

  it('enables the "Abrir link" button when link_rastreio has a value', () => {
    renderStep({ link_rastreio: "https://exemplo.com/rastreio" });

    const openLinkButton = screen.getByRole("button", { name: /abrir link/i });
    expect(openLinkButton).toBeEnabled();
  });

  it('opens the tracking link in a new tab when "Abrir link" is clicked', async () => {
    const user = userEvent.setup();
    renderStep({ link_rastreio: "https://exemplo.com/rastreio" });

    const openLinkButton = screen.getByRole("button", { name: /abrir link/i });
    await user.click(openLinkButton);

    expect(windowOpen).toHaveBeenCalledWith(
      "https://exemplo.com/rastreio",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("does not attempt to open a link when link_rastreio is empty", async () => {
    const user = userEvent.setup();
    renderStep({ link_rastreio: "" });

    const openLinkButton = screen.getByRole("button", { name: /abrir link/i });
    // Button is disabled, but guard against accidental firing anyway
    await user.click(openLinkButton).catch(() => {});

    expect(windowOpen).not.toHaveBeenCalled();
  });

  it("copies the tracking link to the clipboard when the copy button is clicked", async () => {
    renderStep({ link_rastreio: "https://exemplo.com/rastreio" });

    const copyButton = screen.getByRole("button", { name: /copiar link/i });
    fireEvent.click(copyButton);

    expect(clipboardWriteText).toHaveBeenCalledWith(
      "https://exemplo.com/rastreio",
    );
  });

  it("does not copy when link_rastreio is empty", () => {
    renderStep({ link_rastreio: "" });

    const copyButton = screen.getByRole("button", { name: /copiar link/i });
    expect(copyButton).toBeDisabled();
    fireEvent.click(copyButton);

    expect(clipboardWriteText).not.toHaveBeenCalled();
  });

  it("opens the status select and allows choosing an option", async () => {
    const user = userEvent.setup();
    renderStep();

    const statusTrigger = screen.getByRole("combobox", { name: /^status$/i });
    await user.click(statusTrigger);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    await user.click(options[0]);

    expect(statusTrigger).toHaveTextContent(options[0].textContent ?? "");
  });

  it("opens the estado select and allows choosing a UF", async () => {
    const user = userEvent.setup();
    renderStep();

    const estadoTrigger = screen.getByRole("combobox", { name: /^estado$/i });
    await user.click(estadoTrigger);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    await user.click(options[0]);

    expect(estadoTrigger).toHaveTextContent(options[0].textContent ?? "");
  });

  it("renders placeholder text for optional complemento field", () => {
    renderStep();

    expect(
      screen.getByPlaceholderText(/digite o complemento/i),
    ).toBeInTheDocument();
  });

  it("renders the CEP and CNPJ placeholders in the masked format", () => {
    renderStep();

    expect(screen.getByPlaceholderText("00.000-000")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("00.000.000/0000-00"),
    ).toBeInTheDocument();
  });

  it("stores the CNPJ without masks in the form state", async () => {
    const user = userEvent.setup();
    let methods: FormMethods | undefined;

    render(
      <Wrapper
        onReady={(formMethods) => {
          methods = formMethods;
        }}
      />,
    );

    const cnpjInput = screen.getByLabelText(/^cnpj$/i) as HTMLInputElement;
    await user.type(cnpjInput, "12345678000199");

    await waitFor(() => {
      expect(methods?.getValues("cnpj")).toBe("12345678000199");
    });
  });

  it("stores the CEP without masks in the form state", async () => {
    const user = userEvent.setup();
    let methods: FormMethods | undefined;

    render(
      <Wrapper
        onReady={(formMethods) => {
          methods = formMethods;
        }}
      />,
    );

    const cepInput = screen.getByLabelText(/^cep$/i) as HTMLInputElement;
    await user.type(cepInput, "01310100");

    await waitFor(() => {
      expect(methods?.getValues("cep")).toBe("01310100");
    });
  });
});

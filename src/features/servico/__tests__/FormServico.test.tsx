import {
  useEffect,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FormProvider,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { FormServico } from "../components/ServicoForm/FormServico";
import type { ServiceFormData } from "../schemas/servicoSchema";

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
  }) => (
    <select
      id="status"
      aria-label="Status"
      value={value ?? ""}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <option value="">Selecione</option>
      <option value="ativo">Ativo</option>
      <option value="inativo">Inativo</option>
    </select>
  ),

  SelectTrigger: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),

  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectItem: ({ children }: { children: ReactNode; value: string }) => (
    <span>{children}</span>
  ),
}));

type FormServicoTesteProps = {
  valoresIniciais?: Partial<ServiceFormData>;
  comErros?: boolean;
  onSubmit?: SubmitHandler<ServiceFormData>;
};

function FormServicoTeste({
  valoresIniciais,
  comErros = false,
  onSubmit = vi.fn(),
}: Readonly<FormServicoTesteProps>) {
  const methods = useForm<ServiceFormData>({
    defaultValues: {
      nome: "",
      status: undefined,
      ...valoresIniciais,
    },
  });

  const status = useWatch({
    control: methods.control,
    name: "status",
  });

  useEffect(() => {
    if (!comErros) {
      return;
    }

    methods.setError("nome", {
      type: "required",
      message: "Nome do serviço é obrigatório",
    });

    methods.setError("status", {
      type: "required",
      message: "Status é obrigatório",
    });
  }, [comErros, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormServico />

        <output data-testid="status-formulario">{String(status)}</output>

        <button type="submit">Salvar</button>
      </form>
    </FormProvider>
  );
}

describe("FormServico", () => {
  it("deve renderizar os campos do formulário", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByRole("textbox", { name: "Serviço" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: "Status" }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o placeholder do nome", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByPlaceholderText("Digite o nome do serviço..."),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher o nome", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    const input = screen.getByRole("textbox", {
      name: "Serviço",
    });

    await user.type(input, "Jardinagem");

    expect(input).toHaveValue("Jardinagem");
  });

  it("deve converter ativo para true", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Status",
      }),
      "ativo",
    );

    expect(screen.getByTestId("status-formulario")).toHaveTextContent("true");
  });

  it("deve converter inativo para false", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Status",
      }),
      "inativo",
    );

    expect(screen.getByTestId("status-formulario")).toHaveTextContent("false");
  });

  it("deve converter status ativo para true", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "ativo",
    );

    expect(screen.getByTestId("status-formulario")).toHaveTextContent("true");
  });

  it("deve converter status inativo para false", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste valoresIniciais={{ status: true }} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "inativo",
    );

    expect(screen.getByTestId("status-formulario")).toHaveTextContent("false");
  });

  it("deve renderizar os valores iniciais", () => {
    render(
      <FormServicoTeste
        valoresIniciais={{
          nome: "Pintura",
          status: true,
        }}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Serviço" })).toHaveValue(
      "Pintura",
    );

    expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue(
      "ativo",
    );
  });

  it("deve enviar status booleano no submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FormServicoTeste onSubmit={onSubmit} />);

    await user.type(
      screen.getByRole("textbox", { name: "Serviço" }),
      "Pintura",
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Status" }),
      "ativo",
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        nome: "Pintura",
        status: true,
      },
      expect.anything(),
    );
  });

  it("deve renderizar as opções de status", () => {
    render(<FormServicoTeste />);

    expect(screen.getByRole("option", { name: "Ativo" })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Inativo" })).toBeInTheDocument();
  });

  it("deve exibir ativo quando o status inicial for true", () => {
    render(
      <FormServicoTeste
        valoresIniciais={{
          status: true,
        }}
      />,
    );

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("ativo");
  });

  it("deve exibir inativo quando o status inicial for false", () => {
    render(
      <FormServicoTeste
        valoresIniciais={{
          status: false,
        }}
      />,
    );

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("inativo");
  });

  it("deve iniciar sem status selecionado", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("");
  });

  it("deve exibir o erro do campo nome", async () => {
    render(<FormServicoTeste comErros />);

    expect(
      await screen.findByText("Nome do serviço é obrigatório"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Serviço",
      }),
    ).toHaveAttribute("aria-invalid", "true");
  });
});

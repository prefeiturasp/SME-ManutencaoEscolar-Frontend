import type React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { useEffect } from "react";
import { FormServico } from "../components/ServicoForm/FormServico";
import type { ServiceFormData } from "../schemas/servicoSchema";

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <div>
      <select
        aria-label="Status"
        value={value ?? ""}
        onChange={(event) => onValueChange(event.target.value)}
      >
        <option value="">Selecione</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>

      {children}
    </div>
  ),

  SelectTrigger: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),

  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  SelectItem: ({ children }: { value: string; children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

type FormServicoTesteProps = {
  valoresIniciais?: Partial<ServiceFormData>;
  comErros?: boolean;
};

function FormServicoTeste({
  valoresIniciais,
  comErros = false,
}: Readonly<FormServicoTesteProps>) {
  const methods = useForm<ServiceFormData>({
    defaultValues: {
      service_name: "",
      status: undefined,
      ...valoresIniciais,
    },
  });

  useEffect(() => {
    if (!comErros) {
      return;
    }

    methods.setError("service_name", {
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
      <form>
        <FormServico />
      </form>
    </FormProvider>
  );
}

describe("FormServico", () => {
  it("deve renderizar o campo de serviço", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByRole("textbox", {
        name: "Serviço",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o campo de status", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar o placeholder do campo de serviço", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByPlaceholderText("Digite o nome do serviço..."),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher o nome do serviço", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    const input = screen.getByRole("textbox", {
      name: "Serviço",
    });

    await user.type(input, "Jardinagem");

    expect(input).toHaveValue("Jardinagem");
  });

  it("deve exibir os erros dos campos", async () => {
    render(<FormServicoTeste comErros />);

    expect(
      await screen.findByText("Nome do serviço é obrigatório"),
    ).toBeInTheDocument();

    expect(screen.getByText("Status é obrigatório")).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: "Serviço" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("deve permitir selecionar o status ativo", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    const select = screen.getByRole("combobox", {
      name: "Status",
    });

    await user.selectOptions(select, "ativo");

    expect(select).toHaveValue("ativo");
  });

  it("deve permitir selecionar o status inativo", async () => {
    const user = userEvent.setup();

    render(<FormServicoTeste />);

    const select = screen.getByRole("combobox", {
      name: "Status",
    });

    await user.selectOptions(select, "inativo");

    expect(select).toHaveValue("inativo");
  });

  it("deve renderizar os valores iniciais", () => {
    render(
      <FormServicoTeste
        valoresIniciais={{
          service_name: "Pintura",
          status: "ativo",
        }}
      />,
    );

    expect(
      screen.getByRole("textbox", {
        name: "Serviço",
      }),
    ).toHaveValue("Pintura");

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("ativo");
  });

  it("deve renderizar as opções de status", () => {
    render(<FormServicoTeste />);

    expect(
      screen.getByRole("option", {
        name: "Ativo",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Inativo",
      }),
    ).toBeInTheDocument();
  });
});

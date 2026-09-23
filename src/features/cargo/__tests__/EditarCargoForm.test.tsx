import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CargoFormData } from "@/features/cargo/schemas/cargoSchema";

import { EditarCargoForm } from "../components/EditarCargoForm";
import type { Cargo } from "../types/cargos.types";

const {
  editarCargoMock,
  useEditarCargoMock,
  useFeedbackEntidadeMock,
  tratarResultadoMock,
  tratarErroInesperadoMock,
  onOpenChangeMock,
  alertaErroMock,
  formatarDataHoraMock,
} = vi.hoisted(() => ({
  editarCargoMock: vi.fn(),
  useEditarCargoMock: vi.fn(),
  useFeedbackEntidadeMock: vi.fn(),
  tratarResultadoMock: vi.fn(),
  tratarErroInesperadoMock: vi.fn(),
  onOpenChangeMock: vi.fn(),
  alertaErroMock: vi.fn((_props: unknown) => null),
  formatarDataHoraMock: vi.fn(() => "01/09/2026 às 10:30"),
}));

vi.mock("../hooks/useEditarCargo", () => ({
  useEditarCargo: useEditarCargoMock,
}));

vi.mock("@/hooks/useFeedbackEntidade", () => ({
  useFeedbackEntidade: useFeedbackEntidadeMock,
}));

vi.mock("@/utils/formatadores", () => ({
  formatarDataHora: formatarDataHoraMock,
}));

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: alertaErroMock,
}));

vi.mock("../components/ExcluirCargoModal", () => ({
  ExcluirCargoModal: ({ uuid }: { uuid: string }) => (
    <div data-testid="excluir-cargo-modal" data-uuid={uuid}>
      Excluir cargo
    </div>
  ),
}));

vi.mock("../components/FormCargo", async () => {
  const { useFormContext } =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  function FormCargoMock() {
    const { register, getValues, setValue } = useFormContext<CargoFormData>();

    const documentos = getValues("documentos") ?? [];

    return (
      <div>
        <label htmlFor="nome">Nome</label>

        <input id="nome" {...register("nome")} />

        <label htmlFor="exige_documento">Exige documento</label>

        <select id="exige_documento" {...register("exige_documento")}>
          <option value="">Selecione</option>

          <option value="true">Sim</option>

          <option value="false">Não</option>
        </select>

        {documentos.map((_documento, index) => (
          <input
            key={index}
            aria-label={`Documento ${index + 1}`}
            {...register(`documentos.${index}.nome`)}
          />
        ))}

        <label htmlFor="novo_documento">Novo documento</label>

        <button
          type="button"
          onClick={() => {
            setValue("documentos", undefined, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          Remover documentos do formulário
        </button>

        <input id="novo_documento" {...register("novo_documento")} />
      </div>
    );
  }

  return {
    FormCargo: FormCargoMock,
  };
});

type CargoComUuid = Cargo & {
  uuid: string;
};

function criarCargo(dados: Partial<Cargo> = {}): CargoComUuid {
  return {
    nome: "Eletricista",
    exige_documento: true,
    status: true,
    documentos: [
      {
        nome: "Certificado NR-10",
      },
      {
        nome: "Certificado NR-35",
      },
    ],
    criado_por_nome: "João da Silva",
    atualizado_por_nome: "Maria Souza",
    username: "usuario.teste",
    criado_em: "2026-09-01T10:30:00Z",
    atualizado_em: "2026-09-02T11:45:00Z",
    ...dados,

    uuid: dados.uuid ?? "9df513b2-a3d4-4da4-a9ec-8681747094ee",
  } as CargoComUuid;
}

describe("EditarCargoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useEditarCargoMock.mockReturnValue({
      mutate: editarCargoMock,
    });

    useFeedbackEntidadeMock.mockReturnValue({
      tratarResultado: tratarResultadoMock,
      tratarErroInesperado: tratarErroInesperadoMock,
      alertaProps: {
        aberto: false,
        titulo: "",
        mensagem: "",
        onOpenChange: onOpenChangeMock,
      },
    });
  });

  it("renderiza os dados atuais do cargo", () => {
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    expect(
      screen.getByRole("heading", {
        name: "Editar Cargo",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Nome")).toHaveValue("Eletricista");

    expect(screen.getByLabelText("Exige documento")).toHaveValue("true");

    expect(screen.getByLabelText("Documento 1")).toHaveValue("Certificado NR-10");

    expect(screen.getByLabelText("Documento 2")).toHaveValue("Certificado NR-35");

    expect(screen.getByText(/INSERIDO por João da Silva \(usuario\.teste\)/)).toBeInTheDocument();

    expect(screen.getByText(/ALTERADO por Maria Souza \(usuario\.teste\)/)).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/cargos");

    expect(screen.getByTestId("excluir-cargo-modal")).toHaveAttribute("data-uuid", cargo.uuid);
  });

  it("mantém o botão salvar desabilitado sem alterações", () => {
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeDisabled();
  });

  it.each([
    {
      valorRecebido: true,
      valorEsperado: "true",
    },
    {
      valorRecebido: false,
      valorEsperado: "false",
    },
    {
      valorRecebido: undefined,
      valorEsperado: "",
    },
  ])(
    "converte exige_documento $valorRecebido para $valorEsperado",
    ({ valorRecebido, valorEsperado }) => {
      const cargo = criarCargo({
        exige_documento: valorRecebido,
      });

      render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

      expect(screen.getByLabelText("Exige documento")).toHaveValue(valorEsperado);
    },
  );

  it("edita o cargo e adiciona o novo documento ao payload", async () => {
    const user = userEvent.setup();
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    const campoNome = screen.getByLabelText("Nome");

    await user.clear(campoNome);

    await user.type(campoNome, "Engenheiro Eletricista");

    await user.type(screen.getByLabelText("Novo documento"), "  Certificado NR-12  ");

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(editarCargoMock).toHaveBeenCalledTimes(1);
    });

    expect(editarCargoMock).toHaveBeenCalledWith(
      {
        nome: "Engenheiro Eletricista",
        exige_documento: "true",
        documentos: [
          {
            nome: "Certificado NR-10",
          },
          {
            nome: "Certificado NR-35",
          },
          {
            nome: "Certificado NR-12",
          },
        ],
      },
      {
        onSuccess: tratarResultadoMock,
        onError: tratarErroInesperadoMock,
      },
    );
  });

  it("não adiciona novo documento quando contém apenas espaços", async () => {
    const user = userEvent.setup();
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    const campoNome = screen.getByLabelText("Nome");

    await user.clear(campoNome);

    await user.type(campoNome, "Eletricista atualizado");

    await user.type(screen.getByLabelText("Novo documento"), "   ");

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(editarCargoMock).toHaveBeenCalledTimes(1);
    });

    expect(editarCargoMock).toHaveBeenCalledWith(
      {
        nome: "Eletricista atualizado",
        exige_documento: "true",
        documentos: [
          {
            nome: "Certificado NR-10",
          },
          {
            nome: "Certificado NR-35",
          },
        ],
      },
      {
        onSuccess: tratarResultadoMock,
        onError: tratarErroInesperadoMock,
      },
    );
  });

  it("configura o feedback da edição", () => {
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    expect(useEditarCargoMock).toHaveBeenCalledWith(cargo.uuid);

    expect(useFeedbackEntidadeMock).toHaveBeenCalledWith({
      mensagemSucesso: "As alterações foram salvas.",
      contextoErro: "editar cargo",
      rotaRetorno: "/cargos",
    });
  });

  it("repassa as propriedades para o alerta de erro", () => {
    const cargo = criarCargo();

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    const propriedadesAlerta = alertaErroMock.mock.calls.at(-1)?.[0];

    expect(propriedadesAlerta).toEqual(
      expect.objectContaining({
        aberto: false,
        titulo: "",
        mensagem: "",
        onOpenChange: onOpenChangeMock,
      }),
    );
  });

  it("exibe não informado quando não existe nome do usuário", () => {
    const cargo = criarCargo({
      criado_por_nome: undefined,
      atualizado_por_nome: undefined,
    });

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    expect(screen.getAllByText(/Não informado/)).toHaveLength(2);
  });

  it("inicia o nome vazio quando o cargo não possui nome", () => {
    const cargo = criarCargo({
      nome: undefined,
    });

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });

  it("envia lista vazia quando documentos está indefinido", async () => {
    const user = userEvent.setup();

    const cargo = criarCargo({
      exige_documento: false,
    });

    render(<EditarCargoForm uuid={cargo.uuid} cargo={cargo} />);

    await user.click(
      screen.getByRole("button", {
        name: "Remover documentos do formulário",
      }),
    );

    const campoNome = screen.getByLabelText("Nome");

    await user.clear(campoNome);

    await user.type(campoNome, "Eletricista sem documentos");

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    await waitFor(() => {
      expect(editarCargoMock).toHaveBeenCalledTimes(1);
    });

    expect(editarCargoMock).toHaveBeenCalledWith(
      {
        nome: "Eletricista sem documentos",
        exige_documento: "false",
        documentos: [],
      },
      {
        onSuccess: tratarResultadoMock,
        onError: tratarErroInesperadoMock,
      },
    );
  });
});

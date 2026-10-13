import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CadastrarEquipePage from "../page";

const mocks = vi.hoisted(() => ({
  useForm: vi.fn(),
  useWatch: vi.fn(),
  empresas: vi.fn(),
  profissionais: vi.fn(),
  lotes: vi.fn(),
  criar: vi.fn(),
  formEquipe: vi.fn(),
  formProfissionais: vi.fn(),
  feedback: vi.fn(),
  alerta: vi.fn(),
  getValues: vi.fn(),
  setValue: vi.fn(),
  mutate: vi.fn(),
  sucesso: vi.fn(),
  erro: vi.fn(),
}));
vi.mock("react-hook-form", () => ({
  useForm: mocks.useForm,
  useWatch: mocks.useWatch,
  FormProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/features/empresa/hooks/useEmpresas", () => ({ useEmpresas: mocks.empresas }));
vi.mock("@/features/profissional/hooks/useProfissionais", () => ({
  useTodosProfissionais: mocks.profissionais,
}));
vi.mock("@/features/lotes/hooks/useLotes", () => ({ useLotes: mocks.lotes }));
vi.mock("@/features/equipe/hooks/useCriarEquipe", () => ({ useCriarEquipe: mocks.criar }));
vi.mock("@/hooks/useFeedbackEntidade", () => ({ useFeedbackEntidade: mocks.feedback }));
vi.mock("@/features/equipe/components/form/EquipeForm", () => ({
  FormEquipe: (props: unknown) => {
    mocks.formEquipe(props);
    return <div>Formulário equipe</div>;
  },
}));
vi.mock("@/features/equipe/components/form/ProfissionaisEquipeForm", () => ({
  ProfissionaisEquipe: (props: unknown) => {
    mocks.formProfissionais(props);
    return <div>Formulário profissionais</div>;
  },
}));
vi.mock("@/features/equipe/components/form/AlertaErroVinculoEquipe", () => ({
  AlertaErroVinculoEquipe: (props: unknown) => {
    mocks.alerta(props);
    return <div data-testid="alerta" />;
  },
}));
vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav aria-label="Breadcrumb" />,
}));

const dados = {
  nome: "Equipe",
  situacao: "true",
  empresa: "e1",
  lote: "l1",
  profissionais: [{ profissional: "p1", funcao: "f1" }],
};
const alerta = {
  aberto: false,
  titulo: "Erro",
  mensagem: "Mensagem",
  vinculados: [],
  onOpenChange: vi.fn(),
};
const empresas = [
  { id: 1, uuid: "e1", nome: "Empresa ativa", cnpj: "123", status: true },
  { id: 2, uuid: "e2", nome: "Empresa inativa", cnpj: "456", status: false },
];
const profissionais = [
  { uuid: "p1", nome: "Ana", cpf: "111", status: true, funcoes: [] },
  { uuid: "p2", nome: "Bruno", cpf: "222", status: false, funcoes: [] },
];
const methods = (isValid = true, isSubmitting = false) => ({
  control: {},
  getValues: mocks.getValues,
  setValue: mocks.setValue,
  handleSubmit:
    (callback: (values: typeof dados) => void) => (event: { preventDefault: () => void }) => {
      event.preventDefault();
      callback(dados);
    },
  formState: { isValid, isSubmitting },
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useForm.mockReturnValue(methods());
  mocks.useWatch.mockReturnValue("e1");
  mocks.getValues.mockReturnValue("");
  mocks.empresas.mockReturnValue({ data: { results: empresas } });
  mocks.profissionais.mockReturnValue({ data: { results: profissionais } });
  mocks.lotes.mockReturnValue({ data: { results: [] } });
  mocks.criar.mockReturnValue({ mutate: mocks.mutate, isPending: false });
  mocks.feedback.mockReturnValue({
    tratarResultado: mocks.sucesso,
    tratarErroInesperado: mocks.erro,
    alertaProps: alerta,
  });
});

describe("CadastrarEquipePage", () => {
  it("renderiza o cadastro, filtra empresas e profissionais ativos e mostra o formulário de profissionais", () => {
    render(<CadastrarEquipePage />);
    expect(screen.getByRole("heading", { name: "Cadastro de equipe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/empresas/equipes",
    );
    expect(mocks.formEquipe).toHaveBeenLastCalledWith({
      empresasOpcoes: [{ value: "e1", label: "123 - Empresa ativa" }],
      lotesOpcoes: [],
    });
    expect(mocks.lotes).toHaveBeenCalledWith(
      { page: 1, page_size: "all", empresa: 1 },
      { enabled: true, keepPreviousData: false },
    );
    expect(mocks.formProfissionais).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "+ Adicionar profissionais" }));
    expect(mocks.formProfissionais).toHaveBeenLastCalledWith({
      profissionaisOpcoes: [{ value: "p1", label: "111 - Ana" }],
      profissionais: [profissionais[0]],
    });
    expect(
      screen.queryByRole("button", { name: "+ Adicionar profissionais" }),
    ).not.toBeInTheDocument();
    expect(mocks.alerta).toHaveBeenLastCalledWith(alerta);
  });

  it("envia os dados e associa os callbacks de feedback", () => {
    render(<CadastrarEquipePage />);
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar equipe" }));
    expect(mocks.mutate).toHaveBeenCalledWith(dados, {
      onSuccess: mocks.sucesso,
      onError: mocks.erro,
    });
    expect(mocks.feedback).toHaveBeenCalledWith({
      mensagemSucesso: "A equipe foi cadastrada.",
      contextoErro: "criar equipe",
      rotaRetorno: "/empresas/equipes/",
    });
  });

  it.each([
    [false, false, false],
    [true, true, false],
    [true, false, true],
  ])(
    "bloqueia envio com validade %s, submissão %s e pendência %s",
    (valid, submitting, pending) => {
      mocks.useForm.mockReturnValue(methods(valid, submitting));
      mocks.criar.mockReturnValue({ mutate: mocks.mutate, isPending: pending });
      render(<CadastrarEquipePage />);
      expect(screen.getByRole("button", { name: "Cadastrar equipe" })).toBeDisabled();
    },
  );

  it("tolera dados ainda indisponíveis e desabilita a busca sem empresa", () => {
    mocks.empresas.mockReturnValue({});
    mocks.profissionais.mockReturnValue({});
    mocks.lotes.mockReturnValue({});
    mocks.useWatch.mockReturnValue("");
    render(<CadastrarEquipePage />);
    expect(mocks.formEquipe).toHaveBeenLastCalledWith({ empresasOpcoes: [], lotesOpcoes: [] });
    expect(mocks.lotes).toHaveBeenCalledWith(expect.objectContaining({ empresa: undefined }), {
      enabled: false,
      keepPreviousData: false,
    });
    fireEvent.click(screen.getByRole("button", { name: "+ Adicionar profissionais" }));
    expect(mocks.formProfissionais).toHaveBeenLastCalledWith({
      profissionaisOpcoes: [],
      profissionais: [],
    });
  });

  it("tolera lotes ainda indisponíveis para uma empresa selecionada", () => {
    mocks.lotes.mockReturnValue({});
    render(<CadastrarEquipePage />);
    expect(mocks.formEquipe).toHaveBeenLastCalledWith(expect.objectContaining({ lotesOpcoes: [] }));
  });

  it("limpa o lote ao trocar de empresa quando já existe uma seleção", () => {
    mocks.getValues.mockReturnValue("l1");
    const { rerender } = render(<CadastrarEquipePage />);
    mocks.setValue.mockClear();
    mocks.useWatch.mockReturnValue("e2");
    rerender(<CadastrarEquipePage />);
    expect(mocks.setValue).toHaveBeenCalledWith("lote", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  it("inclui períodos atuais e futuros, mesmo inativos, e exclui vencidos, sem UUID ou sem data final", () => {
    const agora = new Date();
    const iso = (data: Date) =>
      `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
    const hoje = iso(agora);
    const passado = new Date(agora);
    passado.setDate(passado.getDate() - 1);
    const futuro = new Date(agora);
    futuro.setDate(futuro.getDate() + 10);
    mocks.lotes.mockReturnValue({
      data: {
        results: [
          {
            uuid: "l1",
            nome: "Atual",
            periodo_inicial: "2026-01-01",
            periodo_final: hoje,
            status: false,
          },
          {
            uuid: "l2",
            nome: "",
            codigo_cadastro: "LOTE-2",
            periodo_inicial: null,
            periodo_final: iso(futuro),
          },
          { uuid: "l3", periodo_final: iso(passado) },
          { uuid: "l4", periodo_final: null },
          { uuid: "l5", periodo_final: "inválida" },
          { periodo_final: hoje },
        ],
      },
    });
    render(<CadastrarEquipePage />);
    const br = (data: string) => data.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
    expect(mocks.formEquipe).toHaveBeenLastCalledWith(
      expect.objectContaining({
        lotesOpcoes: [
          { value: "l1", label: `Atual - 01/01/2026 à ${br(hoje)}` },
          { value: "l2", label: `LOTE-2 - — à ${br(iso(futuro))}` },
        ],
      }),
    );
  });
});

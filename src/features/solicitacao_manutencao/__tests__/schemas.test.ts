import { describe, expect, it, vi } from "vitest";
import { servicoManutencaoSchema } from "../schemas/adicionarServicoManutencaoSchema";
import { dadosSolicitacaoManutencaoSchema } from "../schemas/dadosSolicitacaoManutencaoSchema";
import { informacoesAdicionaisSchema } from "../schemas/informacoesAdicionaisSchema";
import { servicosManutencaoSchema } from "../schemas/servicosManutencaoSchema";
import { solicitacaoManutencaoSchema } from "../schemas/solicitacaoManutencaoSchema";

const servico = () => ({
  id: "local",
  servico: "uuid",
  local_reparo: " Sala 1 ",
  descricao: " Reparo ",
  arquivos: [new File(["foto"], "foto.JPG")],
});
describe("schemas de solicitação", () => {
  it("valida atendimento e informações opcionais", () => {
    for (const tipo_atendimento of ["comum", "urgente", "novo_tipo_do_backend"])
      expect(dadosSolicitacaoManutencaoSchema.safeParse({ tipo_atendimento }).success).toBe(true);
    expect(dadosSolicitacaoManutencaoSchema.safeParse({ tipo_atendimento: " " }).success).toBe(
      false,
    );
    expect(informacoesAdicionaisSchema.parse({})).toEqual({});
    expect(informacoesAdicionaisSchema.parse({ informacoes_adicionais: " texto " })).toEqual({
      informacoes_adicionais: "texto",
    });
  });
  it("normaliza campos e exige um serviço completo", () => {
    expect(servicoManutencaoSchema.parse(servico()).local_reparo).toBe("Sala 1");
    for (const campo of ["id", "servico", "local_reparo", "descricao"])
      expect(servicoManutencaoSchema.safeParse({ ...servico(), [campo]: " " }).success).toBe(false);
    expect(servicosManutencaoSchema.safeParse({ servicos: [] }).success).toBe(false);
    expect(
      solicitacaoManutencaoSchema.safeParse({
        unidade_educacional: "ue",
        tipo_atendimento: "comum",
        servicos: [servico()],
      }).success,
    ).toBe(true);
    expect(
      solicitacaoManutencaoSchema.safeParse({
        unidade_educacional: " ",
        tipo_atendimento: "comum",
        servicos: [servico()],
      }).success,
    ).toBe(false);
  });
  it("exige nome específico apenas para Outros", () => {
    expect(
      servicoManutencaoSchema.safeParse({
        ...servico(),
        servico: "outros",
        servico_especifico: " ",
      }).success,
    ).toBe(false);
    expect(
      servicoManutencaoSchema.parse({
        ...servico(),
        servico: "outros",
        servico_especifico: " Serralheria ",
      }).servico_especifico,
    ).toBe("Serralheria");
  });
  it("rejeita anexos vazios, arquivos falsos e extensões inválidas", () => {
    for (const arquivos of [[], [{}], [null], [new File(["x"], "virus.exe")]])
      expect(servicoManutencaoSchema.safeParse({ ...servico(), arquivos }).success).toBe(false);
    const dados = servico();
    vi.stubGlobal("File", undefined);
    try {
      expect(servicoManutencaoSchema.safeParse(dados).success).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

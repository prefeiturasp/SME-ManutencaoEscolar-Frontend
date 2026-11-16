import type { Cargo } from "@/features/cargo/types/cargos.types";
import type { FuncaoProfissional } from "@/features/profissional/types/profissional.types";

type ObterRotulosParams = {
  cargo?: Pick<Cargo, "exige_documento" | "documentos">;
  funcaoSalva?: FuncaoProfissional;
  uuidCargo?: string;
};

/**
 * Converte os documentos exigidos da função, como foram gravados no vínculo,
 * para os valores do formulário: um item por documento exigido, na ordem.
 */
export function mapearDocumentosSalvos(funcao: FuncaoProfissional) {
  return (
    funcao.documentos_exigidos?.map((exigido) => ({
      uuid: exigido.documento?.uuid,
      nome_documento: exigido.nome,
      nome_original: exigido.documento?.nome_original,
      arquivo_url: exigido.documento?.arquivo,
      arquivo: [],
    })) ?? []
  );
}

/**
 * Cria um espaço vazio para cada documento exigido pelo cargo, guardando o
 * nome do documento para que o vínculo preserve o que foi anexado.
 */
export function criarDocumentosDoCargo(cargo?: Pick<Cargo, "exige_documento" | "documentos">) {
  if (!cargo?.exige_documento) return [];

  return cargo.documentos.map((documento) => ({
    arquivo: [],
    nome_documento: documento.nome,
  }));
}

/**
 * Define quais documentos a função deve exibir.
 *
 * Enquanto o cargo é o mesmo do vínculo salvo, valem os documentos exigidos
 * quando o cargo foi adicionado: mudanças feitas depois no cadastro do cargo
 * não entram sozinhas. Elas só aparecem quando o cargo é removido e
 * adicionado novamente.
 */
export function obterRotulosDocumentos({
  cargo,
  funcaoSalva,
  uuidCargo,
}: ObterRotulosParams): string[] {
  if (funcaoSalva && funcaoSalva.uuid_cargo === uuidCargo) {
    return (funcaoSalva.documentos_exigidos ?? []).map((exigido) => exigido.nome);
  }
  return cargo?.exige_documento ? cargo.documentos.map((documento) => documento.nome) : [];
}

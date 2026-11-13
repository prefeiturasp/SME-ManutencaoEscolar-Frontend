import type { Cargo } from "@/features/cargo/types/cargos.types";
import type { FuncaoProfissional } from "@/features/profissional/types/profissional.types";

type ObterRotulosParams = {
  cargo?: Pick<Cargo, "exige_documento" | "documentos">;
  funcaoSalva?: FuncaoProfissional;
  uuidCargo?: string;
};

/**
 * Converte os documentos já salvos na função para os valores do formulário.
 */
export function mapearDocumentosSalvos(funcao: FuncaoProfissional) {
  return (
    funcao.documentos?.map((documento) => ({
      uuid: documento.uuid,
      nome_documento: documento.nome_documento,
      nome_original: documento.nome_original,
      arquivo_url: documento.arquivo,
      arquivo: [],
    })) ?? []
  );
}

/**
 * Define quais documentos a função deve exibir.
 *
 * Enquanto o cargo é o mesmo do vínculo salvo, vale o que foi anexado quando o
 * cargo foi adicionado: mudanças feitas depois no cadastro do cargo não entram
 * sozinhas. Elas só aparecem quando o cargo é removido e adicionado novamente.
 * Vínculos antigos, sem o nome do documento gravado, seguem o cargo atual.
 */
export function obterRotulosDocumentos({
  cargo,
  funcaoSalva,
  uuidCargo,
}: ObterRotulosParams): string[] {
  if (funcaoSalva && funcaoSalva.uuid_cargo === uuidCargo) {
    const salvos = funcaoSalva.documentos ?? [];
    if (salvos.every((documento) => Boolean(documento.nome_documento))) {
      return salvos.map((documento) => documento.nome_documento as string);
    }
  }
  return cargo?.exige_documento ? cargo.documentos.map((documento) => documento.nome) : [];
}

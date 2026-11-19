import type { UnidadeEducacionalUsuario } from "@/features/login/types/login.types";
import type { DadosInformacoesUE } from "../types/solicitacaoManutencao.types";

export function mapearInformacoesUE(ue?: UnidadeEducacionalUsuario | null): Partial<DadosInformacoesUE> {
  return {
    codesc: ue?.codigo_eol,
    tipoEscola: ue?.tipo_escola?.sigla,
    dre: ue?.diretoria_regional?.nome_curto ?? ue?.diretoria_regional?.nome,
    unidadeEducacional: ue?.nome,
    subprefeitura: ue?.subprefeitura?.nome,
    lote: ue?.lote?.nome,
    cep: ue?.dados?.cep,
    logradouro: ue?.dados?.logradouro,
    numero: ue?.dados?.numero,
    bairro: ue?.dados?.bairro,
    cidade: ue?.dados?.municipio,
    estado: ue?.dados?.uf,
  };
}

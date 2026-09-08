const MILISSEGUNDOS_POR_DIA = 1000 * 60 * 60 * 24;

export function calcularDiasParaVencimento(
  periodoFinal?: string | null,
): number | null {
  if (!periodoFinal) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(`${periodoFinal}T00:00:00`);

  if (Number.isNaN(vencimento.getTime())) {
    return null;
  }

  const diferenca = vencimento.getTime() - hoje.getTime();

  return Math.ceil(diferenca / MILISSEGUNDOS_POR_DIA);
}

export function deveExibirAvisoVencimento(dias: number | null): boolean {
  return dias !== null && dias >= 0 && dias <= 90;
}

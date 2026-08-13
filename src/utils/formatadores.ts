/** Aplica a máscara 00.000.000/0000-00 enquanto o usuário digita. Remove caracteres não numéricos primeiro. */
export function maskCnpj(value: string): string {
  const raw = value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "");

  const base = raw.slice(0, 12); // alfanumérico
  const dv = raw.slice(12).replaceAll(/\D/g, "").slice(0, 2); // somente dígitos
  const cnpj = `${base}${dv}`.slice(0, 14);

  const p1 = cnpj.slice(0, 2);
  const p2 = cnpj.slice(2, 5);
  const p3 = cnpj.slice(5, 8);
  const p4 = cnpj.slice(8, 12);
  const p5 = cnpj.slice(12, 14);

  let out = p1;
  if (cnpj.length > 2) out += `.${p2}`;
  if (cnpj.length > 5) out += `.${p3}`;
  if (cnpj.length > 8) out += `/${p4}`;
  if (cnpj.length > 12) out += `-${p5}`;

  return out;
}

/** Aplica a máscara 00000-000 enquanto o usuário digita. Remove caracteres não numéricos primeiro. */
export function maskCep(value: string): string {
  const digits = value.replaceAll(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

/** Remove os caracteres da máscara do CNPJ, preservando os 12 primeiros caracteres alfanuméricos + 2 dígitos verificadores numéricos. */
export function unmaskCnpj(value: string): string {
  const raw = value.toUpperCase().replaceAll(/[^A-Z0-9]/g, "");
  const base = raw.slice(0, 12);
  const dv = raw.slice(12).replaceAll(/\D/g, "").slice(0, 2);
  return `${base}${dv}`;
}

export function unmaskCep(value: string): string {
  return value.replaceAll(/\D/g, "").slice(0, 8);
}

/** Formata uma string de data ISO como dd/mm/yyyy às HH:MM. Retorna o valor original se inválido. */
export function formatarDataHora(value: string): string {
  const data = new Date(value);
  if (Number.isNaN(data.getTime())) return value;

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, "0");
  const minutos = String(data.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}

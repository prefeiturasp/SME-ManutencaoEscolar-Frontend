import { CircleCheck, CircleX } from "lucide-react";

import { regrasSenha } from "../../schemas/redefinirSenhaSchema";

type CriteriosSenhaProps = Readonly<{
  senha: string;
}>;

export function CriteriosSenha({ senha }: CriteriosSenhaProps) {
  const possuiSenha = senha.length > 0;

  const criterios = [
    {
      id: "maiuscula",
      texto: "Ao menos uma letra maiúscula",
      valido: regrasSenha.temMaiuscula(senha),
    },
    {
      id: "minuscula",
      texto: "Ao menos uma letra minúscula",
      valido: regrasSenha.temMinuscula(senha),
    },
    {
      id: "tamanho",
      texto: "Entre 8 e 12 caracteres",
      valido: regrasSenha.tamanhoValido(senha),
    },
    {
      id: "numero",
      texto: "Ao menos um caractere numérico",
      valido: regrasSenha.temNumero(senha),
    },
    {
      id: "especial",
      texto: "Ao menos um caractere especial (#@&!?._)",
      valido: regrasSenha.temEspecial(senha),
    },
    {
      id: "espacos",
      texto: "Não deve conter espaços em branco",
      valido: regrasSenha.semEspacos(senha),
    },
    {
      id: "acentos",
      texto: "Não deve conter caracteres acentuados",
      valido: regrasSenha.semAcentos(senha),
    },
  ];

  return (
    <div className="w-[460px] rounded-lg bg-muted/50 p-5">
      <p className="mb-5 text-sm font-bold leading-4 text-[var(--background-gray)]">
        Por questões de segurança, a senha deve seguir os seguintes critérios:
      </p>

      <ul className="space-y-2">
        {criterios.map((criterio) => {
          if (!possuiSenha) {
            return (
              <li key={criterio.id} className="text-sm text-muted-foreground">
                {criterio.texto}
              </li>
            );
          }

          return (
            <li
              key={criterio.id}
              className={
                criterio.valido
                  ? "flex items-center gap-2 text-sm text-[var(--success-login)]"
                  : "flex items-center gap-2 text-sm  text-[var(--error-login)]"
              }
            >
              {criterio.valido ? (
                <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <CircleX className="size-4 shrink-0" aria-hidden="true" />
              )}

              <span>{criterio.texto}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

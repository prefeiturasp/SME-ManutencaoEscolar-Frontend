import { X } from "lucide-react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlertaErroProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  width?: number;
  children?: ReactNode;
  onOpenChange: (aberto: boolean) => void;
}>;

export function AlertaErro({
  aberto,
  titulo,
  mensagem,
  width,
  children,
  onOpenChange,
}: AlertaErroProps) {
  const possuiWidthPersonalizado = width !== undefined;

  return (
    <AlertDialog open={aberto} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="lg"
        className={cn(
          "gap-8 p-6 text-[var(--gray)]",
          possuiWidthPersonalizado ? "max-w-none" : "max-w-[750px]",
        )}
        style={
          possuiWidthPersonalizado
            ? {
                width,
                maxWidth: "calc(100vw - 2rem)",
              }
            : undefined
        }
      >
        <AlertDialogCancel asChild>
          <button
            type="button"
            aria-label="Fechar"
            className={cn(
              "absolute right-4 top-4 cursor-pointer",
              "bg-transparent p-1 text-[var(--gray)]",
            )}
          >
            <X
              className="size-6 text-[var(--gray)]"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle
            className={cn(
              "w-full pr-8 text-left text-xl font-bold",
              "text-[var(--gray)]",
            )}
          >
            {titulo}
          </AlertDialogTitle>

          <AlertDialogDescription className="w-full  text-left text-[var(--gray)]">
            {mensagem}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button type="button">Fechar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

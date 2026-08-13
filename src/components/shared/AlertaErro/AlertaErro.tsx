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
import { X } from "lucide-react";

type AlertaErroProps = Readonly<{
  aberto: boolean;
  titulo: string;
  mensagem: string;
  onOpenChange: (aberto: boolean) => void;
}>;

export function AlertaErro({
  aberto,
  titulo,
  mensagem,
  onOpenChange,
}: AlertaErroProps) {
  return (
    <AlertDialog open={aberto} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[750px] gap-8 p-7" size="lg">
        <AlertDialogCancel asChild>
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-4 top-4 cursor-pointer bg-transparent p-1"
          >
            <X
              className="size-6 text-[#06366B]"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader className="items-start text-left">
          <AlertDialogTitle className="w-full text-left text-2xl font-semibold">
            {titulo}
          </AlertDialogTitle>

          <AlertDialogDescription className="w-full pt-4 text-left text-base">
            {mensagem}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button type="button">Fechar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

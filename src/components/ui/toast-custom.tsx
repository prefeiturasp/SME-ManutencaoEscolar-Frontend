"use client";

import { toast } from "sonner";
import { ErrorCircleIcon } from "../icons/Close";
import { SuccessCircleIcon } from "../icons/SimboloAprovado";

type ToastPersonalizadoProps = {
  titulo: string;
  descricao: string;
};

export function toastSucesso({ titulo, descricao }: ToastPersonalizadoProps) {
  return toast.success(titulo, {
    description: descricao,

    icon: <SuccessCircleIcon className="size-[21px] text-[#8DC773] mt-2" />,

    closeButton: true,
    duration: 4000,

    classNames: {
      toast:
        "!relative !flex !h-auto !min-h-[112px] !w-[343px] !items-start !gap-3 " +
        "!rounded-sm !border-0 !bg-[#333638] !px-7 !py-6 !text-white " +
        "!shadow-lg",

      icon: "!m-0 !mt-0.5 !shrink-0",

      content: "!flex !min-w-0 !flex-1 !flex-col !gap-3",

      title: "!m-0 !text-[14px] !font-medium !leading-[20px] !text-white",

      description: "!m-0 !text-[14px] !font-normal !leading-[20px] !text-white",

      closeButton:
        "!absolute !right-4 !top-4 !left-auto !m-0 !size-6 " +
        "!translate-x-0 !translate-y-0 !border-0 !bg-transparent " +
        "!p-0 !text-[#4B5052] hover:!bg-transparent " +
        "hover:!text-[#606668]",
    },
  });
}

export function toastErro({ titulo, descricao }: ToastPersonalizadoProps) {
  return toast.error(titulo, {
    description: descricao,

    icon: <ErrorCircleIcon className="size-[21px] text-[#FD756D] mt-2" />,

    closeButton: true,
    duration: 4000,

    classNames: {
      toast:
        "!relative !flex !h-auto !min-h-[112px] !w-[343px] !items-start !gap-3 " +
        "!rounded-sm !border-0 !bg-[#333638] !px-7 !py-6 !text-white " +
        "!shadow-lg",

      icon: "!m-0 !mt-0.5 !shrink-0",

      content: "!flex !min-w-0 !flex-1 !flex-col !gap-3",

      title: "!m-0 !text-[14px] !font-medium !leading-[20px] !text-white",

      description:
        "!m-0 !text-[14px] !font-normal !leading-[20px] !text-white pr-4",

      closeButton:
        "!absolute !right-4 !top-4 !left-auto !m-0 !size-6 " +
        "!translate-x-0 !translate-y-0 !border-0 !bg-transparent " +
        "!p-0 !text-[#4B5052] hover:!bg-transparent " +
        "hover:!text-[#606668]",
    },
  });
}

import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  ...props
}: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-14 animate-spin text-[#F38D1C]", className)}
      {...props}
    >
      <circle
        cx="28"
        cy="28"
        r="20"
        stroke="currentColor"
        strokeWidth="8"
        opacity="0.1"
      />

      <circle
        cx="28"
        cy="28"
        r="20"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="32 94"
        transform="rotate(-90 28 28)"
      />
    </svg>
  );
}

import type { SVGProps } from "react";

export function CheckIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      className="h-3 w-3 text-white"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

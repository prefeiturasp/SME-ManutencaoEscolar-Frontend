import type { SVGProps } from "react";

export function ChevronCircleIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill={props.fill || "var(--primary)"} />

      <path
        d="M10 8L14 12L10 16"
        stroke={props.stroke || "#FFFFFF"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

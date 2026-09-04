import type { SVGProps } from "react";

export function CalendarWarningIcon({
  className,
  ...props
}: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M17 2V5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

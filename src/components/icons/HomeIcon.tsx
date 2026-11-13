import type { SVGProps } from "react";

export function HomeIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4.79857 10.4367V7.10333H7.46523V10.4367C7.46523 10.8033 7.76523 11.1033 8.1319 11.1033H10.1319C10.4986 11.1033 10.7986 10.8033 10.7986 10.4367V5.77H11.9319C12.2386 5.77 12.3852 5.39 12.1519 5.19L6.57857 0.17C6.32523 -0.0566667 5.93857 -0.0566667 5.68524 0.17L0.111901 5.19C-0.114765 5.39 0.0252346 5.77 0.331901 5.77H1.46523V10.4367C1.46523 10.8033 1.76523 11.1033 2.1319 11.1033H4.1319C4.49857 11.1033 4.79857 10.8033 4.79857 10.4367Z"
        fill={props.fill || "var(--primary)"}
      />
    </svg>
  );
}

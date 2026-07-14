import type { SVGProps } from "react";

export function PowerIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect width="28" height="28" rx="14" fill="#02408B" />

      <path
        d="M12.8525 6V15.2529H15.1475V6H12.8525ZM8.34277 8.34277C6.89505 9.79049 6 11.7909 6 14C6 18.4183 9.58172 22 14 22C18.4183 22 22 18.4183 22 14C22 11.7909 21.1049 9.79049 19.6572 8.34277L18.0459 9.95411C19.0814 10.9895 19.7217 12.4201 19.7217 14C19.7217 17.1597 17.1597 19.7217 14 19.7217C10.8403 19.7217 8.27832 17.1597 8.27832 14C8.27832 12.4201 8.91865 10.9895 9.95411 9.95411L8.34277 8.34277Z"
        fill="white"
      />
    </svg>
  );
}

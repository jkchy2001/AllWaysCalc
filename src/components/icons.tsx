import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 4v2" />
      <path d="M15 18v2" />
      <path d="M9 4v2" />
      <path d="M9 18v2" />
      <path d="M4 9h2" />
      <path d="M4 15h2" />
      <path d="M18 9h2" />
      <path d="M18 15h2" />
    </svg>
  );
}

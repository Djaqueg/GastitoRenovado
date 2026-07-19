import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  highlighted?: boolean;
}

export function Card({
  highlighted = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlighted
          ? "border-primary bg-primary text-white"
          : "border-gray-100 bg-white"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

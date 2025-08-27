import * as React from "react"

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline"
}

export function Badge({ className = "", variant = "default", ...props }: Props) {
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    default: "bg-amber-600 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 text-gray-800",
  }
  return <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${variants[variant]} ${className}`} {...props} />
}

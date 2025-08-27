import * as React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  size?: "sm" | "default" | "lg" | "icon"
}

export function Button({ className = "", variant = "default", size = "default", ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    default: "bg-amber-600 text-white hover:bg-amber-700",
    outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "hover:bg-gray-100 text-gray-900",
    link: "text-amber-600 underline-offset-4 hover:underline",
  }
  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-8 px-3",
    default: "h-9 px-4",
    lg: "h-10 px-6",
    icon: "h-9 w-9",
  }
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}

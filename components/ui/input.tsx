import * as React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className = "", ...props }: Props) {
  const base = "border border-gray-300 bg-white px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm w-full"
  return <input className={`${base} ${className}`} {...props} />
}

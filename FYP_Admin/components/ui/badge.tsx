import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "success" | "warning" | "destructive" | "secondary"
}

export function Badge({ children, variant = "secondary" }: BadgeProps) {
  const variantClasses = {
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}

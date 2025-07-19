import type { ReactNode } from "react"

interface GradientCardProps {
  children: ReactNode
  className?: string
}

export function GradientCard({ children, className = "" }: GradientCardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 border border-gray-200 rounded-xl p-6 shadow-sm backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

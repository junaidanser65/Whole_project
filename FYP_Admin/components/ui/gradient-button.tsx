"use client"

import type { ReactNode } from "react"

interface GradientButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  variant?: "primary" | "secondary"
}

export function GradientButton({ children, onClick, className = "", variant = "primary" }: GradientButtonProps) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"

  const variantClasses =
    variant === "primary"
      ? "bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white hover:shadow-lg hover:shadow-purple-500/25"
      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  )
}

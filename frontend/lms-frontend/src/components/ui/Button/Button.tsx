import React from "react"

type ButtonProps = {
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-[#0f1f3d] hover:bg-[#162a52] text-white px-6 py-2 rounded-md shadow-sm hover:shadow-md transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

import React from "react"

type ButtonProps = {
  children: React.ReactNode
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`bg-[#2f5aa8] hover:bg-[#244b8f] text-white px-6 py-2 rounded-md ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
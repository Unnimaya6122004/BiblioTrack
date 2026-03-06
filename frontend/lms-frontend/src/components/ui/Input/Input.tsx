import React from "react"

type InputProps = {
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2f5aa8] ${className}`}
      {...props}
    />
  )
}
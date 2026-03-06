import React from "react"

type CardProps = {
  title?: string
  children: React.ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full">

      {title && (
        <h3 className="text-lg font-semibold mb-2">
          {title}
        </h3>
      )}

      <div>
        {children}
      </div>

    </div>
  )
}
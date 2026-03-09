import LoginForm from "./LoginForm"
import { BookOpen } from "lucide-react"

type LoginCardProps = {
  error: string
  setError: (value: string) => void
}

export default function LoginCard({ error, setError }: LoginCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl w-[420px] p-10">

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#0f1f3d] text-white p-4 rounded-xl shadow flex items-center justify-center">
          <BookOpen size={28} />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-center">
        Welcome Back
      </h2>

      <p className="text-gray-500 text-center mb-8">
        Sign in to Library Manager
      </p>

      {/* Login Form */}
      <LoginForm error={error} setError={setError} />

    </div>
  )
}

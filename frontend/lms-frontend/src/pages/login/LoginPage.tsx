import { Link } from "react-router-dom"
import LoginCard from "./components/LoginCard"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">

      {/* Soft background glow */}
      <div className="absolute top-32 right-32 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-32 left-32 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>

      {/* Back to Home */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="text-white text-sm px-4 py-2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Top Right GIF */}
      <div className="absolute top-16 right-20 hidden md:block float-slow">
        <div className="w-80 h-80 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center p-6">
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3enowNmU2NXBqdDZ1NGNxZXpob2M0YXljdXJpeHNwa3B4ajVyeHRyZiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/7XmD9ORqMRcU7uK3k9/giphy.webp"
            alt="Library animation"
            className="rounded-2xl w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bottom Left GIF */}
      <div className="absolute bottom-20 left-20 hidden md:block float-slow">
        <div className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-md shadow-2xl flex items-center justify-center p-6">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bnoybmQ4dzlhaTBzYzNjaDI0bHY2d2ZlbGJvbjloYTdydjNvN3A1cyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/p0oio8AE5Y7GRvq9Yy/giphy.gif"
            alt="Reading animation"
            className="rounded-xl w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 transition-transform duration-300 hover:scale-[1.02]">
        <LoginCard />
      </div>

    </div>
  )
}
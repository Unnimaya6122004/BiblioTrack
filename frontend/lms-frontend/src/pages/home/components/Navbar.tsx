import Button from "../../../components/ui/Button/Button"
import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md shadow-sm">

      {/* Logo + Title */}
      <div className="flex items-center gap-3">

        <div className="bg-[#2f5aa8] text-white p-2 rounded-md flex items-center justify-center">
          <BookOpen size={20} />
        </div>

        <span className="text-lg font-semibold">
          Library Manager
        </span>

      </div>

      {/* Sign In */}
      <Link to="/login">
        <Button>Sign In →</Button>
      </Link>

    </div>
  )
}
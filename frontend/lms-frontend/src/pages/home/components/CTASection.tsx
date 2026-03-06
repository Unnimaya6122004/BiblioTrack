import Button from "../../../components/ui/Button/Button"
import { Link } from "react-router-dom"
export default function CTASection() {
  return (
    <div className="text-center py-24 border-t mt-10">

      <h2 className="text-3xl font-semibold mb-4">
        Ready to Manage Your Library?
      </h2>

      <p className="text-gray-500 mb-8">
        Sign in to access the full dashboard and start managing books,
        users, loans, and more.
      </p>

      <Link to="/login">
  <Button className="bg-[#2f5aa8] text-white px-6 py-2 rounded hover:bg-[#274c90]">
    Sign In
  </Button>
</Link>

    </div>
  )
}
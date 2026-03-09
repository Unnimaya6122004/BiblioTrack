import { ArrowUp } from "lucide-react"

export default function ScrollToTopButton() {

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-[#0f1f3d] text-white p-3 rounded-full shadow-lg hover:bg-[#162a52]"
    >
      <ArrowUp size={20} />
    </button>
  )
}
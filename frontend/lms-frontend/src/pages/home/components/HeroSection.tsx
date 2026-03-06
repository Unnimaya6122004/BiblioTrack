import Button from "../../../components/ui/Button/Button"

export default function HeroSection() {
  return (
    <div
      className="relative z-10 text-center py-24 px-6 transition-transform duration-200"
      onMouseMove={(e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 10
        const y = (e.clientY / window.innerHeight - 0.5) * 10
        e.currentTarget.style.transform = `translate(${x}px, ${y}px)`
      }}
    >

      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,91,146,0.12),transparent_60%)]" />

      {/* content */}
      <div className="relative">

        <div className="mb-6">
          <span className="px-4 py-2 rounded-full border text-sm text-gray-600 bg-white shadow-sm">
            The People Library
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
          Where Every Book <br />
          <span className="text-[#3b5b92]">Finds Its</span>{" "}
          <span className="text-[#c17a2b]">Worm</span>
        </h1>

        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          A beautifully crafted system to manage your library's collection,
          members, loans, and reservations all in one place.
        </p>

        <div className="flex justify-center gap-4">

          <a href="#quotes">
  <Button>
    Get Started →
  </Button>
</a>

          <a href="#featured">
  <button className="border px-6 py-2 rounded hover:bg-gray-100">
    Explore Collection
  </button>
</a>

        </div>

      </div>

    </div>
  )
}
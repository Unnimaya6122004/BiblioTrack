import { Quote } from "lucide-react"
import Card from "../../../components/ui/Card/Card"

export default function QuotesSection() {

  const quotes = [
    {
      text: "A room without books is like a body without a soul.",
      author: "Marcus Tullius Cicero",
    },
    {
      text: "The only thing that you absolutely have to know is the location of the library.",
      author: "Albert Einstein",
    },
    {
      text: "I have always imagined that Paradise will be a kind of library.",
      author: "Jorge Luis Borges",
    },
    {
      text: "A library is not a luxury but one of the necessities of life.",
      author: "Henry Ward Beecher",
    },
  ]

  return (
    <div id="quotes" className="py-20 px-10">

      <h2 className="text-3xl text-center font-semibold mb-3">
        Words That Inspire
      </h2>

      <p className="text-center text-gray-500 mb-12">
        Timeless wisdom about the power of books and libraries
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        {quotes.map((q) => (
          <Card key={q.author}>

            {/* Quote Icon */}
            <Quote
              size={30}
              className="text-[#e6a86b] mb-4"
            />

            <p className="italic mb-4 text-gray-700">
              "{q.text}"
            </p>

            <p className="text-sm text-gray-500">
              — {q.author}
            </p>

          </Card>
        ))}

      </div>

    </div>
  )
}
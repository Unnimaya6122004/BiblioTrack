export default function FeaturedBooks() {

  const books = [
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f"
    },
    {
      title: "1984",
      author: "George Orwell",
      img: "https://images.unsplash.com/photo-1512820790803-83ca734da794"
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      img: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d"
    },
    {
      title: "One Hundred Years of Solitude",
      author: "Gabriel García Márquez",
      img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66"
    },
    {
      title: "Brave New World",
      author: "Aldous Huxley",
      img: "https://images.unsplash.com/photo-1519681393784-d120267933ba"
    }
  ]

  return (
    <section id="featured" className="py-16 px-4 sm:px-6 lg:px-10">

      <h2 className="text-3xl font-semibold text-center mb-2">
        Featured Collection
      </h2>

      <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
        Discover some of the most beloved books in our catalog
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {books.map((book) => (
          <article key={book.title} className="group">

            <img
              src={book.img}
              alt={book.title}
              className="h-56 w-full object-cover rounded-xl shadow"
            />

            <div className="mt-3">

              <p className="font-semibold leading-tight">
                {book.title}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {book.author}
              </p>

            </div>

          </article>
        ))}

      </div>

    </section>
  )
}

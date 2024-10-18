import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { GENRE_BOOKS } from "../queries"
import { useState } from "react"

const Books = (props) => {
  const [genre, setGenre]=useState(null)

  const { loading, error, data } = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })

  const { loading: genreLoading, data: genreData } = useQuery(GENRE_BOOKS, {
    variables: { genre },
    skip: !genre, // Skip query if no genre is selected
  })
 
  if (loading || genreLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  // Ensure that `data.allBooks` exists before accessing it
  const books = data ? data.allBooks : []

  const gBooks = genreData ? genreData.allBooks : []

  const genres = [...new Set(books.flatMap((book) => book.genres))]


  const handleGenreClick = (genre) =>{
    setGenre(genre)
    console.log(genre)
    }
  
  if (!props.show) {
    return null
  }

  

  return (
    <div>
      <h2>books</h2>

      {(!genre) && (<table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>)}
      {genre &&(
        <div>
          in genre {genre}
          <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {gBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      )}

          <div>
            {genres.map((genre)=>(
              <button
              key={genre}
              onClick={() => handleGenreClick(genre)}>
                {genre}
              </button>
            ))}
            <button onClick={() => handleGenreClick(null)}>
              all genres
            </button>
          </div>
    </div>
  )
}

export default Books

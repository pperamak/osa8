import { useQuery } from "@apollo/client"
import { USER } from "../queries"
import { GENRE_BOOKS } from "../queries"

const Recommendations=(props)=>{
  const  { loading: userLoading, data: userData } = useQuery(USER)

  const favGenre = userData && userData.me ? userData.me.favoriteGenre : null
  /*if (user.data){
    const favGenre=user.data.favoriteGenre
  }
    */

  const { loading: booksLoading, data: booksData} = useQuery(GENRE_BOOKS, {
    variables: { genre: favGenre },
    skip: !favGenre, // Skip query if no genre is selected
  })

  if (!props.show) {
    return null
  }

  if (userLoading || booksLoading) {
    return <div>Loading...</div>
  }

  if (!favGenre) {
    return <div>No favorite genre set!</div>
  }

  const recoms = booksData ? booksData.allBooks : []
  
   

  return (
    <div>
      <h2>recommendations</h2>
      books in your favorite genre {favGenre}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recoms.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

}

export default Recommendations
import { useState, useEffect } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import LoginForm from "./components/LoginForm"
import Recommendations from "./components/Recommendations"
import { useQuery, useApolloClient, useSubscription } from "@apollo/client"
import { ALL_BOOKS, BOOK_ADDED } from './queries.js'





const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(null)
  const [error, setError] =useState(null)
  const client = useApolloClient()

  useEffect(() =>{
    const storedToken = localStorage.getItem("library-user-token")
    if (storedToken){
      setToken(storedToken)
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) =>{
      //console.log(data.data.bookAdded.title)
      alert(`new book ${data.data.bookAdded.title} added`)

      client.cache.updateQuery({ query: ALL_BOOKS}, ({ allBooks })=>{
        return{
          allBooks: allBooks.concat(data.data.bookAdded),
        }
      })
    }
  })
   
   
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && (<button onClick={() => setPage("add")}>add book</button>)}
        {token && (<button onClick={() => setPage("recommend")}>recommend</button>)}
        {token && (<button onClick={logout}>logout</button>)}
        {(!token) && (<button onClick={() => setPage("login")}>login</button>)}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommendations show={page === "recommend"} />

      <LoginForm show={page === "login"} setToken={setToken} setError={setError} />
    </div>
  )
}

export default App;

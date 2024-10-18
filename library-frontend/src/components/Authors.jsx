import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS } from "../queries"
import { SET_BIRTHYEAR } from "../queries"
import { useState } from "react"
import Select from "react-select"
const Authors = (props) => {
  const [name, setName]=useState("")
  const [year, setYear]=useState("")
  
  const [setBirthYear] =useMutation(SET_BIRTHYEAR)

  const { loading, error, data } = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  })

  if (loading) {
    return <div>Loading...</div>
  }
 
  if (error) {
    return <div>Error: {error.message}</div>
  }
 
  // Ensure that `data.allAuthors` exists before accessing it
  const authors = data ? data.allAuthors : []

  const options = authors.map((author) => ({value: author.name, label: author.name}))

  const submit = async (event) => {
    event.preventDefault()
    setBirthYear({variables: {name, setBornTo: parseInt(year)}})
    setYear("")
  }
  
  if (!props.show) {
    return null
  }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Set BirthYear</h3>
        <form onSubmit={submit}>
          <div>
            name
            <Select
              value={options.find(option => option.value === name)}
              onChange={(selectedOption) => setName(selectedOption.value)}
              options={options}
              />
          </div>
          <div>
            born
            <input value={year} onChange={({ target }) => setYear(target.value)}></input>
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
    )
}

export default Authors

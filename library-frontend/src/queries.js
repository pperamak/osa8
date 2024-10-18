import { gql } from "@apollo/client"

const BOOK_DETAILS = gql`
  fragment BookDetails on Book{
    title 
    author{
    name
    }
    published
    genres
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    bookCount
    id
  }
}
`
export const ALL_BOOKS = gql`
query {
  allBooks { 
    ...BookDetails
}
}
${BOOK_DETAILS}
`

export const USER = gql`
query{
  me{
    username
    favoriteGenre
    id
  }
}
`

export const GENRE_BOOKS = gql`
  query genreBooks($genre: String!){
  allBooks(
  genre: $genre
  ){
    ...BookDetails
  }
  }
  ${BOOK_DETAILS}
`
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]){
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
  ){
    ...BookDetails
    id
  }}
  ${BOOK_DETAILS}
`
export const SET_BIRTHYEAR = gql`
  mutation setBirthYear($name: String! $setBornTo: Int!){
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ){
      name
      id
      born
      }
  }
`

export const LOGIN = gql`
 mutation login($username: String!, $password: String!){
  login(username: $username, password: $password){
    value
    }
  }
  `

  export const BOOK_ADDED=gql`
    subscription{
      bookAdded{
       ...BookDetails
      }
    }
    ${BOOK_DETAILS}
  `

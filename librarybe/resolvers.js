const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const  User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const query = {}

      // If the `author` argument is provided, find the author by name and get their `_id`
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) {
          query.author = author._id // Use the author's ObjectId for filtering
        } else {
          return [] // Return an empty array if the author doesn't exist
        }
      }

      // If the `genre` argument is provided, filter by the genre
      if (args.genre) {
        query.genres = args.genre // Match books that include the genre
      }

      // Find books that match the optional filters and populate the author field
      return Book.find(query).populate('author')
      
    },
    allAuthors: async () => {
      //return Author.find({}).populate('books')
      const authorsWithBookCount = await Author.aggregate([
        {
          $lookup: {
            from: "books", // Join with the 'books' collection
            localField: "_id", // Match author._id
            foreignField: "author", // with book.author (which is ObjectId)
            as: "books" // Resulting array will be stored in the `books` field
          }
        },
        {
          $addFields: {
            bookCount: { $size: "$books" } // Add a new field `bookCount` with the length of the books array
          }
        },
        {
          // Explicitly include _id (which will be used as id in GraphQL)
          $project: {
            id: "$_id",        // Include the _id field (which maps to 'id' in GraphQL)
            name: 1,       // Include other fields like name
            born: 1,       // Include born if necessary
            bookCount: 1   // Include the computed bookCount field
          }
        }
      ]);
      //console.log(authorsWithBookCount)
      return authorsWithBookCount;
    },
    me: (root, args, context) =>{
      return context.currentUser
    }
  },
  /*Author: {
    /*bookCount: (root) => {
      return root.books.length
    }*/
    /*bookCount: async (root) => {
      return Book.countDocuments({ author: root._id})
    }*/
  //},
  Mutation: {
    addBook: async (root, args, context) =>{
      if (!context.currentUser) {
        throw new GraphQLError('Unauthorized: You must be logged in to add a book', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }
      try{
      let author =await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }
      const book = new Book({ 
        title: args.title,
        published: args.published,
        author: author._id, // Use the ObjectId of the author
        genres: args.genres
       })
      await book.save()

      //author.books= author.books.concat(book._id)

      pubsub.publish('BOOK_ADDED', { bookAdded: Book.findById(book._id).populate('author')})
      return Book.findById(book._id).populate('author')
      
    }catch (error){
      throw new GraphQLError('Failed to add the book', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.title,
          error
        }
    })
  }
    
    },
    editAuthor: async (root, args, context) =>{
      if (!context.currentUser) {
        throw new GraphQLError('Unauthorized: You must be logged in to edit an author', {
          extensions: { code: 'UNAUTHORIZED' }
        })
      }
      try{
      // Find the author by name and update their birth year
      const updatedAuthor = await Author.findOneAndUpdate(
        { name: args.name },  // Find the author by name
        { born: args.setBornTo },  // Set the new birth year
        { new: true }  // Return the updated document
      )

      // If the author is not found, return null
      if (!updatedAuthor) {
        throw new GraphQLError('Author not found', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name
          }
        })
    }
      // Return the updated author
      return updatedAuthor
    }catch (error) {
      throw new GraphQLError('Failed to edit author', {
        extensions: {
          code: 'BAD_USER_INPUT',
          invalidArgs: args.name,
          error
        }
      })
    }
  },
  createUser: async (root, args) => {
    const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre  })

    return user.save()
      .catch(error => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })

    if ( !user || args.password !== 'secret' ) {
      throw new GraphQLError('wrong credentials', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })        
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
  },

},

Subscription: {
  bookAdded: {
    subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
  }
}
}

module.exports = resolvers
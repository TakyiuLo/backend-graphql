// Since GraphQL is pretty new, there are many tools from different library
const path = require('path')
const { makeExecutableSchema, mergeSchemas } = require('graphql-tools')
const { importSchema } = require('graphql-import')

// make executable schema
function makeSchema (typeDefName, resolverName) {
  const typeDefs = importSchema(path.join(__dirname, `typeDef/${typeDefName}`))
  const resolvers = require(`./resolvers/${resolverName}`)
  return makeExecutableSchema({ typeDefs, resolvers })
}

// list of schemas that wanted to merge
const bookSchema = makeSchema('books.graphql', 'books-resolver')
const userSchema = makeSchema('users.graphql', 'users-resolver')
const exampleSchema = makeSchema('examples.graphql', 'examples-resolver')

// merge schemas
const schema = mergeSchemas({
  schemas: [
    bookSchema,
    userSchema,
    exampleSchema
  ]
})

// pass schema directly to apollo-server
module.exports = schema

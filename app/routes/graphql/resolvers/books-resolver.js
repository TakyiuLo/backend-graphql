const Book = require('../../../models/books')

const handle = require('../../../../lib/error_handler')
const customErrors = require('../../../../lib/custom_errors')
const handle404 = customErrors.handle404
const { replaceID } = require('../custom-fn')

// INDEX
function getBooks (parent, args, context, info) {
  let query = replaceID(args)

  return Book.find(query)
    .catch(handle)
}

// SHOW
function getBook (parent, args, context, info) {
  return Book.findById(args.id)
    .then(handle404)
    .catch(handle)
}

// CREATE
function createBook (parent, args, context, info) {
  return Book.create(args)
    .catch(handle)
}

// UPDATE
function updateBook (parent, args, context, info) {
  function removeEmptyStringKeys (res) {
    Object.keys(args).forEach(key => {
      if (args[key] === '') {
        delete args[key]
      }
    })
    return res
  }

  return Book.findById(args.id)
    .then(handle404)
    .then(removeEmptyStringKeys)
    .then(book => book.update(args)) // had to return this otherwise wouldn't work
    .then(() => Book.findById(args.id))
    .catch(handle)
}

// DELETE
function deleteBook (parent, args, context, info) {
  function successResponse () {
    return {
      status: '200',
      message: 'Successfully Deleted'
    }
  }

  return Book.findById(args.id)
    .then(handle404)
    .then(book => book.remove())
    .then(successResponse)
    .catch(handle)
}

const booksResolver = {
  Query: {
    books: getBooks,
    book: getBook
  },
  Mutation: {
    createBook,
    updateBook,
    deleteBook
  }
}

module.exports = booksResolver

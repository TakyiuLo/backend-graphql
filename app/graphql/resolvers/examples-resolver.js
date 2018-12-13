// pull in Mongoose model for examples
const Example = require('../../models/example')

// we'll use this to intercept any errors that get thrown and send them
// back to the client with the appropriate status code
const handle = require('../../../lib/error_handler')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

const { replaceID, requireToken } = require('../custom-fn')

// INDEX
function getExamples (parent, args, context, info) {
  return Example.find()
    .then(examples => {
      // `examples` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return examples.map(example => replaceID(example.toObject()))
    })
    // stringify object for graphql due to type ID vs objectID
    .then(examples => JSON.parse(JSON.stringify(examples)))
    // if an error occurs, pass it to the handler
    .catch(handle)
}

// SHOW
function getExample (parent, args, context, info) {
  return Example.findById(args.id)
    .then(handle404)
    .then(example => example.toObject())
    // replace _id to id
    .then(replaceID)
    .catch(handle)
}

// CREATE
function createExample (parent, args, context, info) {
  const req = context

  // set owner of new example to be current user
  args.owner = req.user._id.toString()

  return Example.create(args)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(example => example.toObject())
    // stringify object for graphql due to type ID vs objectID
    .then(example => JSON.parse(JSON.stringify(example)))
    // replace _id to id
    .then(replaceID)
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(handle)
}

// UPDATE
function updateExample (parent, args, context, info) {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  // delete req.body.example.owner
  const req = context

  return Example.findById(args.id)
    .then(handle404)
    .then(example => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, example)

      // the client will often send empty strings for parameters that it does
      // not want to update. We delete any key/value pair where the value is
      // an empty string before updating
      Object.keys(args).forEach(key => {
        if (args[key] === '') {
          delete args[key]
        }
      })

      // pass the result of Mongoose's `.update` to the next `.then`
      return example.update(args)
    })
    // if that succeeded, return 200 and JSON
    .then(() => Example.findById(args.id))
    .then(examples => JSON.parse(JSON.stringify(examples)))
    .then(replaceID)
    // if an error occurs, pass it to the handler
    .catch(handle)
}

// DESTROY
function deleteExample (parent, args, context, info) {
  const req = context

  return Example.findById(args.id)
    .then(handle404)
    .then(example => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, example)
      // delete the example ONLY IF the above didn't throw
      example.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => ({
      status: '204',
      message: 'Successfully Deleted'
    }))
    // if an error occurs, pass it to the handler
    .catch(handle)
}

const examplesResolver = {
  Query: {
    examples: getExamples,
    example: getExample
  },
  Mutation: {
    createExample: (...args) => requireToken(createExample, args),
    updateExample: (...args) => requireToken(updateExample, args),
    deleteExample: (...args) => requireToken(deleteExample, args)
  }
}

module.exports = examplesResolver

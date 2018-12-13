const User = require('../../models/user')

// custom errors and handler
const handle = require('../../../lib/error_handler')
const { BadParamsError } = require('../../../lib/custom_errors')

// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const crypto = require('crypto')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')

// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10

// custom functions
const { replaceID, requireToken } = require('../custom-fn')

// SIGN UP
// CREATE
function signUp (parent, args, context, info) {
  const credentials = args

  // start a promise chain, so that any errors will pass to `handle`
  return Promise.resolve(credentials)
    // reject any requests where `credentials.password` is not present, or where
    // the password is an empty string
    .then(credentials => {
      if (!credentials ||
          !credentials.password ||
          credentials.password !== credentials.password_confirmation) {
        throw new BadParamsError()
      }
    })
    // generate a hash from the provided password, returning a promise
    .then(() => bcrypt.hash(credentials.password, bcryptSaltRounds))
    .then(hash => {
      // return necessary params to create a user
      return {
        email: credentials.email,
        hashedPassword: hash
      }
    })
    // create user with provided email and hashed password
    .then(user => User.create(user))
    // need to stringify id
    .then(user => JSON.parse(JSON.stringify(user.toObject())))
    // need to replace _id with id
    .then(replaceID)
    // pass any errors along to the error handler
    .catch(handle)
}

// SIGN IN
// SHOW
function signIn (parent, args, context, info) {
  const credentials = args
  const pw = credentials.password
  let user

  // find a user based on the email that was passed
  return User.findOne({ email: credentials.email })
    .then(record => {
      // if we didn't find a user with that email, send 422
      if (!record) {
        throw new BadParamsError()
      }
      // save the found user outside the promise chain
      user = record
      // `bcrypt.compare` will return true if the result of hashing `pw`
      // is exactly equal to the hashed password stored in the DB
      return bcrypt.compare(pw, user.hashedPassword)
    })
    .then(correctPassword => {
      // if the passwords matched
      if (correctPassword) {
        // the token will be a 16 byte random hex string
        const token = crypto.randomBytes(16).toString('hex')
        user.token = token
        // save the token to the DB as a property on user
        return user.save()
      } else {
        // throw an error to trigger the error handler and end the promise chain
        // this will send back 422 and a message about sending wrong parameters
        throw new BadParamsError()
      }
    })
    .catch(handle)
}

function changePassword (parent, args, context, info) {
  const req = context

  let user
  // `req.user` will be determined by decoding the token payload
  return User.findById(req.user.id)
    // save user outside the promise chain
    .then(record => { user = record })
    // check that the old password is correct
    .then(() => bcrypt.compare(args.old, user.hashedPassword))
    // `correctPassword` will be true if hashing the old password ends up the
    // same as `user.hashedPassword`
    .then(correctPassword => {
      // throw an error if the new password is missing, an empty string,
      // or the old password was wrong
      if (!args.new || !correctPassword) {
        throw new BadParamsError()
      }
    })
    // hash the new password
    .then(() => bcrypt.hash(args.new, bcryptSaltRounds))
    .then(hash => {
      // set and save the new hashed password in the DB
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => ({
      status: '204',
      message: 'Successfully Changed Password'
    }))
    // pass any errors along to the error handler
    .catch(handle)
}

function signOut (parent, args, context, info) {
  const { user } = context

  // create a new random token for the user, invalidating the current one
  user.token = crypto.randomBytes(16)
  // save the token and respond with 204
  return user.save()
    .then(() => ({
      status: '204',
      message: 'Successfully Signed Out'
    }))
    .catch(handle)
}

const usersResolver = {
  Query: {
    users: (parent, args, context, info) => {
      return User.find()
    }
  },
  Mutation: {
    signUp,
    signIn,
    changePassword: (...args) => requireToken(changePassword, args),
    signOut: (...args) => requireToken(signOut, args)
  }
}

module.exports = usersResolver

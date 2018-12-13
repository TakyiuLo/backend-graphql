/*
 * replaceID
 *   #function: replace id to _id or _id to id
 *   @params: args
 *   @returns: a new object with replaced <id>
 */

function replaceID (args) {
  let query = {...args}

  if (args.id) {
    query._id = args.id
    delete query.id
  } else if (args._id) {
    query.id = args._id
    delete query._id
  }
  return query
}

/*
 * getFiles
 *   #function: synchronously get all files with extension under a directory
 *   @params: directory_path, extension
 *   @returns: a list of file names
 */
const fs = require('fs')
const path = require('path')

function getFiles (pathDir, ext) {
  const dirPath = path.resolve(pathDir)

  return fs.readdirSync(dirPath)
    .filter(file => path.extname(file).toLowerCase() === ext)
}

/*
 * pLog
 *   #function: print out obj, use in the `.then` chain
 *   @params: obj
 *   @returns: obj
 */
function plog (obj) {
  console.log(obj)
  return obj
}

/*
 * requireToken
 *   #function: get User, and pass user into context
 *   @params: resolver, context
 *   @returns: return whatever the resolver returns
 */
const User = require('../../models/user')
const handle = require('../../../lib/error_handler')
const { handleUser, BadParamsError } = require('../../../lib/custom_errors')

function requireToken (resolver, [parent, args, context, info]) {
  const req = context
  const auth = req.headers.authorization
  // check if authorization exists
  if (!auth) {
    throw new BadParamsError()
  }
  const [authType, token] = auth.split(' ')

  console.log(`Using AuthType: ${authType} with resolver: ${resolver.name}`)

  return User.findOne({ token })
    .then(handleUser)
    .then(user => (context.user = user))
    .then(() => resolver(parent, args, context, info))
    .catch(handle)
}

module.exports = {
  replaceID,
  getFiles,
  plog,
  requireToken
}

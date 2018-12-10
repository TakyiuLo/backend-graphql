/*
 * replaceID
 *   #function: replace id to _id
 *   @params: args
 *   @returns: a new object with replaced _id
 */

function replaceID (args) {
  let query = {...args}

  if (args.id) {
    query._id = args.id
    delete query.id
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

module.exports = {
  replaceID,
  getFiles
}

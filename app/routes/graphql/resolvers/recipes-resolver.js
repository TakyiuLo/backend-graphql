const Recipe = require('../../../models/recipes')

const { replaceID } = require('../custom-fn')

// INDEX, SHOW
function getRecipes (parent, args, context, info) {
  let query = replaceID(args)
  return Recipe.find(query)
}

const recipesResolver = {
  Query: {
    recipes: getRecipes
  }
}

module.exports = recipesResolver

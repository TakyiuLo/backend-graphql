# GraphQL Template
This is a self study on backend GraphQL.
It used: 
- Apollo-server / `apollo-server-express`
- GraphQL
- `graphql-import` from Prisma
- `graphql-tools`
- MongoDB / Mongoose

##### Plan:
1. build based on GA's Express Template
2. implement `/graphql` as a route before removing other routes
3. implement examples `books` and `recipes` models
4. Understand how authentication/authorization works in GraphQL
5. Implement Auth
6. Maybe implement Prisma for more functionality in auto generator. (Might need 
   to learn TypeScripts for Prisma.) **No need for prisma auto**
   Prisma server currently only have PSQL, maybe later I'll implement this

##### Explanations:
From my understanding,
- Apollo-server is build on top of Express which means you can still use Express
  middlewares.
- GraphQL only needed one route, so every actions can be done to one route
- To CRUD, you would need resolvers with typeDefs for mutations
- GraphQL has schema, so typeDefs and resolvers together will form a schema
- TypeDefs are the definition of models for GraphQL
- Resolvers are the functions for manipulating data, such as using third-party
  libraries with our data
- GraphQL DOES NOT know how to communicate with your database so you got to define it
- Resolvers need to output whatever the Type(an object) is
- So GraphQL ONLY allow ONE definition of Query and Mutation. However, schemas can
  can be merge.

##### To Build:
1. build Mongo models
2. build typeDefs for GraphQL
3. build resolvers
4. merge schemas

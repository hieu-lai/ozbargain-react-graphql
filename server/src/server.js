import { GraphQLServer, PubSub } from 'graphql-yoga'
import { ApolloServer } from 'apollo-server-express'
import prisma from './prisma'
import { resolvers, fragmentReplacements } from './resolvers'

const pubsub = new PubSub()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context(request) {
    return {
      pubsub,
      prisma,
      request
    }
  },
  fragmentReplacements 
})

export { server as default }
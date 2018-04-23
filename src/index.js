const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const resolvers = require('./resolvers')
const { formatError } = require('apollo-errors');
const { AuthDirective } = require('./directives/auth');
const { RelayIdDirective } = require('./directives/relay-id');

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
    relayID: RelayIdDirective,
  },
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the Prisma DB schema
      endpoint: process.env.PRISMA_ENDPOINT,    // the endpoint of the Prisma DB service (value is set in .env)
      secret: process.env.PRISMA_SECRET,        // taken from database/prisma.yml (value is set in .env)
      debug: true,                              // log all GraphQL queries & mutations
    }),
  }),
})

server.start({
  formatError,
}, () => console.log('Server is running on http://localhost:4000'))

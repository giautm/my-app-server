const { GraphQLServer } = require('graphql-yoga')
const resolvers = require('./resolvers')
const { formatError } = require('apollo-errors');
const { AuthDirective } = require('./directives/auth');
const { RelayIdDirective } = require('./directives/relay-id');
const { Context } = require('./Context');

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  schemaDirectives: {
    auth: AuthDirective,
    relayID: RelayIdDirective,
  },
  context: req => new Context(req),
})

server.start({
  formatError,
}, () => console.log('Server is running on http://localhost:4000'))

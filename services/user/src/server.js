const { ApolloServer } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const { applyMiddleware } = require('graphql-middleware');
const { permissions } = require('./permissions');
const typeDefs = require('./def');
const resolvers = require('./resolvers');

const server = new ApolloServer({
  schema: applyMiddleware(
    buildFederatedSchema([
      {
        typeDefs,
        resolvers
      }
    ]),
    permissions
  ),
  context: ({ request }) => {
    const user = request?.headers.user ? JSON.parse(request.headers.user) : null;
    return { user };
  }
});

module.exports = server;

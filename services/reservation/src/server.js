const { ApolloServer } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const { applyMiddleware } = require('graphql-middleware');
const { PrismaClient } = require('@dao/prisma');
const { typeDefs } = require('./typedefs');
const { resolvers } = require('./resolvers');

const prisma = new PrismaClient();
const server = new ApolloServer({
  schema: applyMiddleware(
    buildFederatedSchema({
      typeDefs,
      resolvers
    })
  ),
  context: ({ request }) => {
    const user = request.headers.user ? JSON.parse(request.headers.user) : null;
    return {
      user,
      prisma
    };
  }
});

module.exports = server;

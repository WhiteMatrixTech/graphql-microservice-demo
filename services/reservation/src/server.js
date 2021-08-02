const { ApolloServer } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const typeDefs = require('./def');
const resolvers = require('./resolvers');

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

module.exports = server;

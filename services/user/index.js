const { ApolloServer, gql } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const fastify = require('fastify');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String!
    address: String
  }
  type Query {
    user(id: ID!): User
  }
  # This was originally in the stitched gateway
  extend type Reservation @key(fields: "id") {
    id: ID! @external
    userId: ID! @external
    user: User @requires(fields: "userId")
  }
`;

const lookupUser = () => ({
  id: 1,
  firstName: 'Jake',
  lastName: 'Dawkins',
  address: 'everywhere'
});

const resolvers = {
  Query: {
    user: () => lookupUser()
  },
  User: {
    __resolveReference() {
      return lookupUser();
    }
  },
  Reservation: {
    /**
     * The old stitched resolvers called the Query.user resolver to lookup
     * a user, but since we're in this service, we can just use whatever we
     * need to lookup a user.
     */
    user: ({ userId }) => lookupUser(userId)
  }
};

(async () => {
  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs,
        resolvers
      }
    ])
  });

  const app = fastify();
  await server.start();
  app.register(server.createHandler({ cors: true }));

  app.listen(4001).then((url) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();

const { ApolloServer, gql } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const { applyMiddleware } = require('graphql-middleware');
const fastify = require('fastify');
const jwt = require('jsonwebtoken');
const { permissions } = require('./permissions');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    username: String!
  }
  extend type Query {
    user(id: ID!): User
    viewer: User!
  }

  extend type Mutation {
    login(username: String!, password: String!): String
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
  username: 'willin',
  password: 'willin',
  roles: ['admin'],
  permissions: ['read:any_account', 'read:own_account']
});

const resolvers = {
  Query: {
    user: () => lookupUser(),
    viewer(parent, args, { user }) {
      return user;
    }
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
  },
  Mutation: {
    login(parent, { username }) {
      const { id, permissions: p, roles } = lookupUser();
      return jwt.sign({ id, username, roles, permissions: p }, 'helloworld', {
        algorithm: 'HS256',
        subject: username,
        expiresIn: '7d'
      });
    }
  }
};

(async () => {
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
      const user = request.headers.user ? JSON.parse(request.headers.user) : null;
      return { user };
    }
  });

  const app = fastify();
  await server.start();
  app.register(server.createHandler({ cors: true }));

  app.listen(4001).then((url) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();

const { ApolloServer, gql } = require('apollo-server-fastify');
const { buildFederatedSchema } = require('@apollo/federation');
const fastify = require('fastify');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Reservation @key(fields: "id") {
    id: ID!
    userId: ID!
    reservationDate: String!
    status: String
  }
  type Query {
    reservations: [Reservation]!
    reservation(id: ID!): Reservation
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    reservations: [Reservation]
  }
`;

const lookupReservation = () => ({
  id: 1,
  userId: 1,
  reservationDate: 'today',
  status: 'good'
});

const resolvers = {
  Query: {
    reservations: () => [lookupReservation(), lookupReservation()],
    reservation: () => lookupReservation()
  },
  User: {
    reservations: () => [lookupReservation()]
  },
  Reservation: {
    __resolveReference: () => lookupReservation(),
    userId: (res) => res.userId
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

  app.listen(4002).then((url) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();

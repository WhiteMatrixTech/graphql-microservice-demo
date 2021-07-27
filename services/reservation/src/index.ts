import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

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

/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
    // eslint-disable-next-line
    __resolveReference: (obj?: any) => lookupReservation(),
    userId: (res?: any) => {
      console.log(res);
      // eslint-disable-next-line
      return res.userId;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

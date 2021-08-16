const { gql } = require('apollo-server-fastify');

const queries = gql`
  type Query {
    reservations(first: Int, last: Int, before: String, after: String): ReservationConnection
    reservation(id: ID!): Reservation
  }
`;

module.exports = {
  queries
};

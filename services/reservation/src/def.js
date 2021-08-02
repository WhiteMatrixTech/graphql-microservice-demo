const { gql } = require('apollo-server-fastify');

// Construct a schema, using GraphQL schema language
module.exports = gql`
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

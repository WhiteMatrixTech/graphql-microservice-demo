const { gql } = require('apollo-server-fastify');

const objects = gql`
  type User implements Node @key(fields: "id") {
    id: ID!
    username: String!
    reservations(first: Int, last: Int, before: String, after: String): ReservationConnection
  }

  extend type Reservation implements Node @key(fields: "id") {
    id: ID! @external
    location: String
    userId: ID! @external
    user: User @requires(fields: "userId")
  }
`;

module.exports = {
  objects
};

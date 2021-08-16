const { gql } = require('apollo-server-fastify');

const objects = gql`
  type Reservation @key(fields: "id") {
    id: ID!
    userId: ID!
    reservationDate: String!
    status: String
  }
  extend type User @key(fields: "id") {
    id: ID! @external
  }
`;

module.exports = {
  objects
};

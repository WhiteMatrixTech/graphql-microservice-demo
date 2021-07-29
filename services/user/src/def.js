const { gql } = require('apollo-server-fastify');

// Construct a schema, using GraphQL schema language
module.exports = gql`
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

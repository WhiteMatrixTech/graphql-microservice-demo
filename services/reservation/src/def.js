const { gql } = require('apollo-server-fastify');

// Construct a schema, using GraphQL schema language
module.exports = gql`
  type Reservation @key(fields: "id") {
    id: ID!
    userId: ID!
    reservationDate: String!
    status: String
  }
  type Node {
    id: String
    item: Item
  }
  type Edges {
    cursor: String
    node: Node
  }
  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean
    hasNextPage: Boolean
  }
  type Pagination {
    edges: [Edges]
    totalCount: Int
    pageInfo: PageInfo
  }
  type Query {
    reservations(first: String, after: String): Pagination
    reservation(id: ID!): Reservation
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    reservations: [Reservation]
  }
  union Item = User | Reservation
`;

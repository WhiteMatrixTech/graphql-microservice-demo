const { gql } = require('apollo-server-fastify');

const connections = gql`
  type UserEdge {
    node: User
    cursor: String!
  }

  type ReservationEdge {
    node: Reservation
    cursor: String!
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPrevPage: Boolean!
    hasNextPage: Boolean!
  }

  type UserConnection {
    edges: [UserEdge]
    nodes: [User]
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type ReservationConnection {
    edges: [ReservationEdge]
    nodes: [Reservation]
    totalCount: Int!
    pageInfo: PageInfo!
  }
`;

module.exports = {
  connections
};

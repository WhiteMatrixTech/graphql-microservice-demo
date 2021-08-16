const { gql } = require('apollo-server-fastify');

const queries = gql`
  extend type Query {
    user(id: ID!): User
    viewer: User!
    users(first: Int, after: String): UserConnection
    getUserWhere(user: searchUser): [User]
  }
`;

module.exports = {
  queries
};

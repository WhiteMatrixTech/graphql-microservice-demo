const { gql } = require('apollo-server-fastify');

const mutations = gql`
  extend type Mutation {
    login(username: String!, password: String!): String
  }
`;

module.exports = {
  mutations
};

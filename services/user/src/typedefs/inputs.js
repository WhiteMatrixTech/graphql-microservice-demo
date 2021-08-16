const { gql } = require('apollo-server-fastify');

const inputs = gql`
  input searchUser {
    username: String
  }
`;

module.exports = {
  inputs
};

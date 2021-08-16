const { gql } = require('apollo-server-fastify');

const interfaces = gql`
  interface Node {
    id: ID!
  }
`;

module.exports = {
  interfaces
};

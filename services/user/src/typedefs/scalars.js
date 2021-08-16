const { gql } = require('apollo-server-fastify');

const scalars = gql`
  scalar Date
`;

module.exports = {
  scalars
};

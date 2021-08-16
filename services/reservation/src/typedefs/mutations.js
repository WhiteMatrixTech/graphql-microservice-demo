const { gql } = require('apollo-server-fastify');

const mutations = gql`
  extend type Mutation {
    updateReservation(location: String!): Reservation
  }
`;

module.exports = {
  mutations
};

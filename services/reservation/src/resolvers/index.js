const { mutations } = require('./mutations');
const { queries } = require('./queries');

const resolvers = {
  ...mutations,
  ...queries
};

module.exports = {
  resolvers
};

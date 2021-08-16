const { connections } = require('./connections');
const { inputs } = require('./inputs');
const { interfaces } = require('./interfaces');
const { mutations } = require('./mutations');
const { objects } = require('./objects');
const { queries } = require('./queries');
const { scalars } = require('./scalars');

const typeDefs = [connections, inputs, interfaces, mutations, objects, queries, scalars];

module.exports = {
  typeDefs
};

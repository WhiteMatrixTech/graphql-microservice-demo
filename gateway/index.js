const { ApolloServer } = require('apollo-server-fastify');
const { ApolloGateway } = require('@apollo/gateway');
const fastify = require('fastify');
const jwt = require('fastify-jwt');

const gateway = new ApolloGateway({
  // This entire `serviceList` is optional when running in managed federation
  // mode, using Apollo Graph Manager as the source of truth.  In production,
  // using a single source of truth to compose a schema is recommended and
  // prevents composition failures at runtime using schema validation using
  // real usage-based metrics.
  serviceList: [
    { name: 'user', url: 'http://localhost:4001/graphql' },
    { name: 'reservation', url: 'http://localhost:4002/graphql' }
  ],

  // Experimental: Enabling this enables the query plan view in Playground.
  __exposeQueryPlanExperimental: false
});

(async () => {
  const server = new ApolloServer({
    gateway,

    // Apollo Graph Manager (previously known as Apollo Engine)
    // When enabled and an `ENGINE_API_KEY` is set in the environment,
    // provides metrics, schema management and trace reporting.
    engine: false,

    // Subscriptions are unsupported but planned for a future Gateway version.
    subscriptions: false
  });
  const app = fastify();
  await server.start();
  app.register(jwt, {
    secret: 'helloworld',
    sign: {
      algorithm: 'HS256',
      expiresIn: '7d',
      audience: 'viewer',
      issuer: 'whitematrix.io'
    },
    verify: {
      audience: 'viewer',
      issuer: 'whitematrix.io'
    }
  });
  app.addHook('onRequest', (request) => request.jwtVerify());
  app.register(server.createHandler({ cors: true }));

  app.listen(4000).then((url) => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at ${url}`);
  });
})();

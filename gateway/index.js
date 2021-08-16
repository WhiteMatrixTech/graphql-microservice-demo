const { ApolloServer } = require('apollo-server-fastify');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const fastify = require('fastify');
const jwt = require('fastify-jwt');
const fetch = require('node-fetch');

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
  __exposeQueryPlanExperimental: false,

  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      // 对各个服务发起的请求超时时间为3秒
      fetcher: (input, init) => {
        if (init) {
          // eslint-disable-next-line no-param-reassign
          init.timeout = 3000;
        } else {
          // eslint-disable-next-line no-param-reassign
          init = { timeout: 3000 };
        }
        return fetch(input, init);
      },
      willSendRequest({ request, context }) {
        request.http.headers.set('user', context.user ? JSON.stringify(context.user) : null);
      }
    });
  }
});

(async () => {
  const server = new ApolloServer({
    gateway,

    // Apollo Graph Manager (previously known as Apollo Engine)
    // When enabled and an `ENGINE_API_KEY` is set in the environment,
    // provides metrics, schema management and trace reporting.
    engine: false,

    // Subscriptions are unsupported but planned for a future Gateway version.
    subscriptions: false,

    context: ({ request }) => {
      const user = request.user || null;
      return { user };
    },
    formatError: (err) => {
      // Don't give the specific errors to the client.
      if (err.message.startsWith('Database Error: ')) {
        return new Error('Internal server error');
      }
      return err;
    }
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
  app.addHook('onRequest', (request) =>
    request.jwtVerify().catch((e) => {
      console.error(e);
    })
  );
  app.register(server.createHandler({ cors: true }));

  app.listen(4000).then((url) => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at ${url}`);
  });
})();

const fastify = require('fastify');
const server = require('./src/server');

(async () => {
  const app = fastify();
  await server.start();
  app.register(server.createHandler({ cors: true }));

  app.listen(4002).then((url) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();

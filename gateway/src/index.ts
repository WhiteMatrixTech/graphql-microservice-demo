import { ApolloGateway, ServiceEndpointDefinition } from '@apollo/gateway';
import { ApolloServer } from 'apollo-server';

const serviceList: ServiceEndpointDefinition[] = [
  // Configurable
  { name: 'Users', url: 'http://localhost:4001' },
  { name: 'Reservations', url: 'http://localhost:4002' }
];

const gateway = new ApolloGateway({ serviceList });

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async (): Promise<void> => {
  const { schema, executor } = await gateway.load();
  const server = new ApolloServer({
    schema,
    executor
  });
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  server.listen(8080).then(({ url }) => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at ${url}`);
  });
})();

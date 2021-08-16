const { MongoMemoryServer } = require('mongodb-memory-server-core');
const { PrismaClient } = require('@dao/prisma');
const { test, debug } = require('.');
const { ApolloServer } = require('apollo-server-fastify');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const casual = require('casual');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'user', url: 'http://localhost:4001/graphql' },
    { name: 'reservation', url: 'http://localhost:4002/graphql' }
  ],
  __exposeQueryPlanExperimental: false,
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        request.http.headers.set('user', JSON.stringify({
          id: 1,
          username: 'willin',
          password: 'willin',
          roles: ['admin'],
          permissions: ['read:any_account', 'read:own_account']
        }));
      }
    });
  }
});

const server = new ApolloServer({
  gateway,

  engine: false,

  subscriptions: false,

  context: ({ request }) => {
    return {};
  },
  formatError: (err) => {
    if (err.message.startsWith('Database Error: ')) {
      return new Error('Internal server error');
    }
    return err;
  }
});

test('generate data', async (t) => {
  // const mongod = await MongoMemoryServer.create({
  //   instance: {
  //     ip: '127.0.0.1',
  //     port: 27017,
  //     dbName: 'test'
  //   }
  // });
  const prisma = new PrismaClient();
  const insertUsers = [];
  const insertReservation = [];
  for (let i = 0; i < 100; i += 1) {
    const user = {
      username: casual.username
    };
    insertUsers.push(user);
  }
  const user = await prisma.user.createMany({
    data: insertUsers
  });

  t.is(typeof user, 'object');
  const findUsers = await prisma.user.findMany({
    take: 100
  });
  t.is(typeof findUsers, 'object');
  for (let i = 0; i < findUsers.length; i += 1) {
    const reserv = {
      userId: findUsers[i].id,
      location: casual.address,
      reservationDate: casual.date('YYYY-MM-DD HH:mm:ss'),
      status: casual.letter
    };
    insertReservation.push(reserv);
  }
  await prisma.reservation.createMany({
    data: insertReservation
  });
  // await mongod.stop();
});

test('login', async (t) => {
  const result = await server.executeOperation({
    query: `mutation LoginMutation($loginUsername: String!, $loginPassword: String!) {
      login(username: $loginUsername, password: $loginPassword)
    }`,
    variables: {
      loginUsername: 'willin',
      loginPassword: 'willin'
    }
  });
  debug(result.data);
  t.is(typeof result.data.login, 'string');
});

test('viewer', async (t) => {
  const result = await server.executeOperation({
    query: `query Query {
      viewer {
        username
        id
      }
    }`
  });
  debug(result.data);
  t.is(typeof result.data, 'object');
});

test('query user', async (t) => {
  const result = await server.executeOperation({
    query: `query Query($userId: ID!) {
      user(id: $userId) {
        id
        username
      }
    }`,
    variables: {
      userId: '6110c69300530f1200aba9bc'
    }
  });
  debug(result);
  t.is(typeof result.data.user, 'object');
});

test('query reservation', async (t) => {
  const result = await server.executeOperation({
    query: `query Query($reservationId: ID!) {
      reservation(id: $reservationId) {
        location
        status
        user {
          username
        }
        reservationDate
      }
    }`,
    variables: {
      reservationId: '6110c69300530f1200abaa20'
    }
  });
  debug(result);
  t.is(typeof result.data.reservation, 'object');
});

test('query reservations', async (t) => {
  const result = await server.executeOperation({
    query: `query Query($reservationsAfter: String, $reservationsFirst: Int) {
      reservations(after: $reservationsAfter, first: $reservationsFirst) {
        totalCount
        nodes {
          location
          status
          userId
          user {
            username
          }
        }
        pageInfo {
          endCursor
          hasPrevPage
          hasNextPage
          startCursor
        }
      }
    }`,
    variables: {
      reservationsAfter: "",
      reservationsFirst: 5,
    }
  });
  debug(result);
  t.is(typeof result.data.reservations, 'object');
});

test('query users', async (t) => {
  const result = await server.executeOperation({
    query: `query Query($userId: ID!, $reservationsAfter: String, $reservationsFirst: Int) {
      user(id: $userId) {
        id
        username
        reservations(after: $reservationsAfter, first: $reservationsFirst) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
            hasPrevPage
            startCursor
          }
          nodes {
            location
            reservationDate
          }
        }
      }
    }`,
    variables: {
      userId: '6110c69300530f1200aba9bc',
      reservationsAfter: "",
      reservationsFirst: 5
    }
  });
  debug(result.data);
  t.is(typeof result.data, 'object');
});

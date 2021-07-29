const { test, debug } = require('.');
const server = require('../src/server');

const LOGIN = `mutation LoginMutation($loginUsername: String!, $loginPassword: String!) {
  login(username: $loginUsername, password: $loginPassword)
}`;

test('demo', async (t) => {
  const result = await server.executeOperation({
    query: LOGIN,
    variables: {
      loginUsername: 'willin',
      loginPassword: 'willin'
    }
  });
  debug(result.data);
  t.is(typeof result?.data?.login, 'string');
});

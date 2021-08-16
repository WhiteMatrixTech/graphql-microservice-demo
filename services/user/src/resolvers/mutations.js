const jwt = require('jsonwebtoken');

const lookupUser = () => ({
  id: 1,
  username: 'willin',
  password: 'willin',
  roles: ['admin'],
  permissions: ['read:any_account', 'read:own_account']
});

const mutations = {
  Mutation: {
    login(parent, { username }) {
      const { id, permissions: p, roles } = lookupUser();
      return jwt.sign({ id, username, roles, permissions: p }, 'helloworld', {
        algorithm: 'HS256',
        subject: username,
        expiresIn: '7d',
        audience: 'viewer',
        issuer: 'whitematrix.io'
      });
    }
  }
};

module.exports = {
  mutations
};

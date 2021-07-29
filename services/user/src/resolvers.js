const jwt = require('jsonwebtoken');

const lookupUser = () => ({
  id: 1,
  username: 'willin',
  password: 'willin',
  roles: ['admin'],
  permissions: ['read:any_account', 'read:own_account']
});

const resolvers = {
  Query: {
    user: () => lookupUser(),
    viewer(parent, args, { user }) {
      return user;
    }
  },
  User: {
    __resolveReference() {
      return lookupUser();
    }
  },
  Reservation: {
    /**
     * The old stitched resolvers called the Query.user resolver to lookup
     * a user, but since we're in this service, we can just use whatever we
     * need to lookup a user.
     */
    user: ({ userId }) => lookupUser(userId)
  },
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

module.exports = resolvers;

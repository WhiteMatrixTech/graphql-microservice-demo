const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@dao/prisma');

const prisma = new PrismaClient();

const lookupUser = async (username, id) => {
  const result = await prisma.user.findUnique({
    ...(username === undefined
      ? {}
      : {
          where: {
            username
          }
        }),
    ...(id === undefined
      ? {}
      : {
          where: {
            id
          }
        })
  });
  return result;
};

const resolvers = {
  Query: {
    // FIXME: ?
    user: () => lookupUser(),
    viewer(parent, args, { user }) {
      return user;
    }
  },
  User: {
    __resolveReference() {
      // FIXME: ?
      return lookupUser();
    }
  },
  Reservation: {
    /**
     * The old stitched resolvers called the Query.user resolver to lookup
     * a user, but since we're in this service, we can just use whatever we
     * need to lookup a user.
     */
    user: ({ userId }) => lookupUser(undefined, userId)
  },
  Mutation: {
    async login(parent, { username, password }) {
      const { id, permissions: p, roles, password: pwd } = await lookupUser(username);
      if (password !== pwd) {
        return new Error('INVALID USER');
      }
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

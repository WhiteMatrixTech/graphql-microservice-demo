const { connectionResolver } = require('@graphql/common');
const { findUser, findUsers } = require('../dao/user.dao');

const queries = {
  // 联合类型必须声明一个__resolveType函数，告诉GraphQL用什么类型。
  Node: {
    __resolveType(obj) {
      if (obj.username) {
        return 'User';
      }
      if (obj.location) {
        return 'Reservation';
      }
      return null;
    }
  },
  Query: {
    user: (parent, args, context) => findUser({ id: args.userId }, context.prisma.user),
    viewer(parent, args, { user }) {
      return user;
    },
    users: (parent, args, context) => connectionResolver(args, context.prisma.user),
    getUserWhere: (parent, args, context) => findUsers(args.user, context.prisma.user)
  },
  User: {
    __resolveReference(user, args, context) {
      return findUser({ id: user.id }, context.prisma.user);
    },
    reservations: (parent, args, context) => connectionResolver({ userId: parent.id, ...args }, context.prisma.reservation)
  },
  Reservation: {
    /**
     * The old stitched resolvers called the Query.user resolver to lookup
     * a user, but since we're in this service, we can just use whatever we
     * need to lookup a user.
     */
    user: ({ userId }, args, context) => findUser({ id: userId }, context.prisma.user)
  }
};

module.exports = {
  queries
};

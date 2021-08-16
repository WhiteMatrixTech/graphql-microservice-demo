const { connectionResolver } = require('@graphql/common');
const { findReservation } = require('../dao/reservation.dao');

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
    reservations: (parent, args, context) => connectionResolver(args, context.prisma.reservation),
    reservation: (parent, args, context) => findReservation({ id: args.id }, context.prisma.reservation)
  },
  Reservation: {
    // __resolveReference(reservation, args, context) {
    //   return findReservation({ id: reservation.id }, context.prisma.reservation);
    // },
    userId: (parent, args, context) => findReservation({ id: args.id }, context.prisma.reservation).then(reservation => reservation.userId)
  }
};

module.exports = {
  queries
};

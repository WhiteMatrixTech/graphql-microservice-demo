const { PrismaClient } = require('@dao/prisma');
const { pageResolver } = require('./pagination');

const prisma = new PrismaClient();

const lookupReservation = async (id) => {
  const result = await prisma.reservation.findUnique({
    ...(id === undefined ? { where: { id: '6107968d00f7177d005f84d0' } } : { where: { id } })
  });
  return result;
};

const resolvers = {
  Query: {
    reservations: () => async (parent, args) => pageResolver(parent, args, prisma.reservation),
    reservation: () => lookupReservation()
  },
  User: {
    reservations: () => [lookupReservation()]
  },
  Reservation: {
    __resolveReference: () => lookupReservation(),
    userId: (res) => res.userId
  }
};

module.exports = resolvers;

const { PrismaClient } = require('.');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  await prisma.user
    .create({
      data: {
        username: 'willin',
        password: 'willin',
        roles: ['admin'],
        permissions: ['read:any_account', 'read:own_account']
      }
    })
    .then((res) => {
      console.log(res);
      return prisma.reservation
        .create({
          data: { reservationDate: 'today', status: 'good', userId: res.id }
        })
        .then((resp) => {
          console.log(resp);
        });
    });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    prisma.$disconnect();
  });

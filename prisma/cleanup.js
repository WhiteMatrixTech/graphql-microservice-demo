const { PrismaClient } = require('.');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  await prisma.reservation.deleteMany().then((res) => {
    console.log(res);
  });
  await prisma.user.deleteMany().then((resp) => {
    console.log(resp);
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect);

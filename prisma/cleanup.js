const { PrismaClient } = require('@dao/prisma');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  await prisma.user
    .deleteMany()
    .then((res) => console.log(res))
    .catch((e) => console.error(e));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(() => prisma.$disconnect);

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.cashRegister.create({
    data: {
      user: {
        connect: { id: 2 },
      },
      balance: 0, // Default balance as per schema
    },
  });
  console.log('Cash register created for userId: 2');
}

main()
  .catch((e) => console.error(e))
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => await prisma.$disconnect());

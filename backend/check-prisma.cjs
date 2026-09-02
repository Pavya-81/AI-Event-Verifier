const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

console.log(
  Object.keys(prisma)
    .filter((key) => !key.startsWith("_"))
    .join("\n")
);

prisma.$disconnect();
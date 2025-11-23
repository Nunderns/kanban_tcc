let PrismaClient: { new (): any };
try {
  PrismaClient = require("@prisma/client").PrismaClient;
} catch {
  PrismaClient = class {} as unknown as { new (): any };
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma: any =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

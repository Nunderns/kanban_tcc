import { prisma } from "@/lib/prisma";

// Cast prisma to any since the generated client isn't available during CI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

async function main() {
  const user = await db.user.create({
    data: {
      name: "Usuário Teste",
      email: "teste@example.com",
      password: "senha123"
    },
  });

  console.log("Usuário criado com ID:", user.id);

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  db.$disconnect();
});

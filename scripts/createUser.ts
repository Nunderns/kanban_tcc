import { prisma } from "@/lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Usuário Teste",
      email: "teste@example.com",
      password: "senha123"
    },
  });

  console.log("Usuário criado com ID:", user.id);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});

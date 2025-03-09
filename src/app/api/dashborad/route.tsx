// src/app/api/dashboard/route.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
      },
    });

    const tasks = await prisma.task.findMany({
      include: {
        project: true,
        user: true,
      },
    });

    const users = await prisma.user.findMany();

    return new Response(
      JSON.stringify({
        projects,
        tasks,
        users,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data' }),
      { status: 500 }
    );
  }
}

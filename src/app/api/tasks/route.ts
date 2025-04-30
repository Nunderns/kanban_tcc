import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { title, description, userId, status } = data;

  if (!title || !userId) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
  }

  const newTask = await prisma.task.create({
    data: {
      title,
      description,
      userId,
      status: status || 'TODO',
    },
  });

  return NextResponse.json(newTask, { status: 201 });
}

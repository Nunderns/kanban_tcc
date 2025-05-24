// src/app/api/tasks/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";

// Simulação de banco de dados em memória (substitua por chamada ao Prisma ou ORM real)
const fakeDB: Record<string, any[]> = {
  "2": [
    { id: 1, user: "Henri", action: "editou", field: "title", oldValue: "Antigo", newValue: "Novo", timestamp: new Date().toISOString() }
  ]
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  const activities = fakeDB[taskId] || [];
  return NextResponse.json(activities);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  const body = await req.json();

  const newActivity = {
    id: Date.now(),
    ...body,
    timestamp: new Date().toISOString(),
  };

  if (!fakeDB[taskId]) fakeDB[taskId] = [];
  fakeDB[taskId].unshift(newActivity);

  return NextResponse.json(newActivity, { status: 201 });
}

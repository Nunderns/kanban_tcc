import { NextRequest, NextResponse } from "next/server";

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  field?: string;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

const fakeDB: Record<string, ActivityLog[]> = {
  "2": [
    {
      id: 1,
      user: "Henri",
      action: "editou",
      field: "title",
      oldValue: "Antigo",
      newValue: "Novo",
      timestamp: new Date().toISOString(),
    },
  ],
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
  const body: Partial<ActivityLog> = await req.json();

  const newActivity: ActivityLog = {
    id: Date.now(),
    user: body.user || "Desconhecido",
    action: body.action || "realizou uma ação",
    field: body.field,
    oldValue: body.oldValue ?? null,
    newValue: body.newValue ?? null,
    timestamp: new Date().toISOString(),
  };

  if (!fakeDB[taskId]) {
    fakeDB[taskId] = [];
  }

  fakeDB[taskId].unshift(newActivity);

  return NextResponse.json(newActivity, { status: 201 });
}

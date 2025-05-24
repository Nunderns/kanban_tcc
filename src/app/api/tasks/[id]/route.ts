import { NextRequest, NextResponse } from "next/server";

// Definindo a estrutura de um WorkItem (ajuste conforme seu app)
interface WorkItem {
  id: number;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignees?: string[] | null;
  priority: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  creator?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  module?: string | null;
  cycle?: string | null;
  parentId?: number | string | null;
  labels?: string[] | null;
}

// Simulando um banco de dados em memória
const workItemDB: Record<string, WorkItem> = {
  "4": {
    id: 4,
    title: "Tarefa Exemplo",
    status: "TODO",
    priority: "LOW",
  },
};

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const taskId = context.params.id;
    const body = await req.json();

    const existingItem = workItemDB[taskId];
    if (!existingItem) {
      return NextResponse.json(
        { error: "Item não encontrado." },
        { status: 404 }
      );
    }

    const updatedItem: WorkItem = {
      ...existingItem,
      ...body, // sobrescreve os campos alterados
    };

    workItemDB[taskId] = updatedItem;

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Erro no PATCH /work-items/[id]:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

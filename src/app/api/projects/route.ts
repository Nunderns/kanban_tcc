import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Rota GET: Retorna todos os projetos
export async function GET() {
  try {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 });
  }
}

// Rota POST: Criar um novo projeto com imagem
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let imagePath = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = formData.get("name") as string;
      const file = formData.get("image") as File | null;

      console.log("Nome recebido:", name); // 🔍 Log para depuração

      if (!name) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório" }, { status: 400 });
      }

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "public/uploads");

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        imagePath = `/uploads/${file.name}`;
        fs.writeFileSync(path.join(uploadDir, file.name), buffer);
      }
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      name = body.name;
      imagePath = body.image || null;
    } else {
      return NextResponse.json({ error: "Tipo de conteúdo não suportado" }, { status: 415 });
    }

    // Verifica se name e imagePath são válidos
    console.log("Criando projeto com:", { name, imagePath });

    const newProject = await prisma.project.create({
      data: { name, image: imagePath },
    });

    if (!newProject) {
      throw new Error("Falha ao criar o projeto no banco de dados.");
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto:", error);
    return NextResponse.json({ error: "Erro ao criar projeto", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProjectCreateData {
  name: string;
  description: string | null;
  color: string;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        owner: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = projects.map((p: {
      id: number;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: String(p.id),
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      color: '#3b82f6',
      isFavorite: false,
      status: 'ACTIVE',
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, description, color }: ProjectCreateData = await request.json();

    if (!name) {
      return new NextResponse('Project name is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const created = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const responseBody = {
      id: String(created.id),
      name: created.name,
      description: created.description,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      color: color || '#3b82f6',
      isFavorite: false,
      status: 'ACTIVE',
    };

    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

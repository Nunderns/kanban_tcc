import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ProjectCreateData {
  name: string;
  description: string | null;
  color: string;
  workspaceId: number;
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
    console.log('Received request to create project');
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestData = await request.json();
    console.log('Request data:', requestData);
    
    const { name, description, color, workspaceId } = requestData as ProjectCreateData;

    if (!name) {
      console.log('Validation error: Project name is required');
      return new NextResponse('Project name is required', { status: 400 });
    }

    if (!workspaceId) {
      console.log('Validation error: Workspace ID is required');
      return new NextResponse('Workspace ID is required', { status: 400 });
    }

    console.log('Looking up user:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found:', session.user.email);
      return new NextResponse('User not found', { status: 404 });
    }

    console.log('Verifying workspace access for user:', user.id, 'workspace:', workspaceId);
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    });

    if (!workspaceMember) {
      console.log('Access denied: User does not have access to workspace', { userId: user.id, workspaceId });
      return new NextResponse('You do not have access to this workspace', { status: 403 });
    }

    console.log('Creating project with data:', {
      name,
      description,
      ownerId: user.id,
      workspaceId,
    });

    const created = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: user.id,
        workspaceId: workspaceId,
      },
      include: {
        workspace: {
          select: {
            slug: true,
          },
        },
      },
    });

    console.log('Project created successfully:', created);

    const responseBody = {
      id: String(created.id),
      name: created.name,
      description: created.description,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      color: color || '#3b82f6',
      isFavorite: false,
      status: 'ACTIVE',
      workspaceSlug: created.workspace.slug,
    };

    console.log('Sending response:', responseBody);
    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

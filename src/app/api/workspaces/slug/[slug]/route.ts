import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        slug,
        members: {
          some: {
            user: {
              email: session.user.email,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!workspace) {
      return new NextResponse('Workspace not found', { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

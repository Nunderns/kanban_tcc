import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const workspaceSlug = searchParams.get('workspaceSlug');

        if (!workspaceSlug) {
            return NextResponse.json(
                { error: 'Workspace slug is required' },
                { status: 400 }
            );
        }
        const workspace = await prisma.workspace.findFirst({
            where: {
                slug: workspaceSlug,
                members: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            select: {
                id: true,
            },
        });

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found or access denied' },
                { status: 404 }
            );
        }
        await prisma.taskActivity.count({
            where: {
                task: {
                    workspaceId: workspace.id,
                },
            },
        });
        type ActivityWithTask = {
            id: string;
            user: string;
            action: string;
            field: string | null;
            oldValue: string | null;
            newValue: string | null;
            createdAt: Date;
            task: {
                title: string | null;
                assignedUser: {
                    id: string;
                    name: string | null;
                    email: string | null;
                } | null;
            } | null;
        };

        type UserInfo = {
            id: string;
            name: string | null;
            email: string | null;
        };
        const activities = await prisma.taskActivity.findMany({
            where: {
                task: {
                    workspaceId: workspace.id,
                },
            },
            include: {
                task: {
                    select: {
                        title: true,
                        assignedUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        }) as unknown as ActivityWithTask[];
        const userIds = Array.from(new Set(
            activities
                .map((activity: ActivityWithTask) => activity.user)
                .filter(Boolean)
        ));
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { id: { in: userIds } },
                    { email: { in: userIds } },
                    { name: { in: userIds } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        }) as UserInfo[];
        const userMap = new Map<string, string>();
        users.forEach((user: UserInfo) => {
            if (user.id) userMap.set(user.id, user.name || user.email || user.id);
            if (user.email) userMap.set(user.email, user.name || user.email || '');
            if (user.name) userMap.set(user.name, user.name);
        });
        const formattedActivities = activities.map((activity: ActivityWithTask) => {
            const assignedUserName = activity.task?.assignedUser?.name ||
                activity.task?.assignedUser?.email ||
                activity.task?.assignedUser?.id ||
                null;
            const displayUser = userMap.get(activity.user) ||
                (assignedUserName && userMap.get(assignedUserName)) ||
                activity.user;
            let formattedOldValue = activity.oldValue;
            let formattedNewValue = activity.newValue;
            if (activity.field === 'responsável') {
                if (formattedOldValue && userMap.has(formattedOldValue)) {
                    formattedOldValue = userMap.get(formattedOldValue)!;
                }
                if (formattedNewValue && userMap.has(formattedNewValue)) {
                    formattedNewValue = userMap.get(formattedNewValue)!;
                }
            }

            return {
                id: activity.id,
                user: displayUser,
                action: activity.action,
                field: activity.field,
                taskTitle: activity.task?.title || 'Tarefa sem título',
                oldValue: formattedOldValue,
                newValue: formattedNewValue,
                createdAt: activity.createdAt.toISOString(),
            };
        });

        return NextResponse.json(formattedActivities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

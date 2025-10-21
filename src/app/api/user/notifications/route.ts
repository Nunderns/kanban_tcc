import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface NotificationSettings {
  emailNotifications: boolean;
  notifyPropertyChanges: boolean;
  notifyStateChange: boolean;
  notifyWorkItemCompleted: boolean;
  notifyComments: boolean;
  notifyMentions: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  notifyPropertyChanges: true,
  notifyStateChange: true,
  notifyWorkItemCompleted: false,
  notifyComments: true,
  notifyMentions: true,
};

export async function GET() {
  
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Não autorizado' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      
      await prisma.$queryRaw`SELECT 1`;
      
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          notificationSettings: true
        }
      });

      if (!user) {
        return new NextResponse(
          JSON.stringify({ 
            success: false,
            error: 'Usuário não encontrado' 
          }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (!user.notificationSettings) {
        return new NextResponse(
          JSON.stringify({
            success: true,
            ...DEFAULT_NOTIFICATION_SETTINGS
          }),
          { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      let settings: NotificationSettings;
      try {
        settings = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...(typeof user.notificationSettings === 'string' 
            ? JSON.parse(user.notificationSettings)
            : user.notificationSettings)
        };
      } catch (error) {
        console.error('[GET /api/user/notifications] Error parsing settings, using defaults:', error);
        settings = DEFAULT_NOTIFICATION_SETTINGS;
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          ...settings
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('[GET /api/user/notifications] Database error:', error);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Erro ao buscar configurações',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/user/notifications:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro inesperado',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: 'Não autorizado' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const updateData = await request.json();
      
      const validFields: (keyof NotificationSettings)[] = [
        'emailNotifications',
        'notifyPropertyChanges',
        'notifyStateChange',
        'notifyWorkItemCompleted',
        'notifyComments',
        'notifyMentions'
      ];
      const validatedData: Partial<NotificationSettings> = {};
      const invalidFields: string[] = [];
      
      for (const field of validFields) {
        if (field in updateData) {
          const value = updateData[field];
          if (typeof value === 'boolean') {
            validatedData[field as keyof NotificationSettings] = value;
          } else {
            invalidFields.push(field);
          }
        }
      }

      if (invalidFields.length > 0) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Campos inválidos',
            details: `Os seguintes campos não são válidos: ${invalidFields.join(', ')}`
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { notificationSettings: true }
      });

      let currentSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
      
      if (currentUser?.notificationSettings) {
        try {
          currentSettings = {
            ...currentSettings,
            ...(typeof currentUser.notificationSettings === 'string'
              ? JSON.parse(currentUser.notificationSettings)
              : currentUser.notificationSettings)
          };
        } catch {
        }
      }

      const updatedSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...currentSettings,
        ...updateData
      };

      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          notificationSettings: updatedSettings
        },
        select: {
          id: true,
          email: true,
          notificationSettings: true
        }
      });
      let parsedSettings: NotificationSettings;
      if (updatedUser.notificationSettings) {
        try {
          parsedSettings = {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...(typeof updatedUser.notificationSettings === 'string'
              ? JSON.parse(updatedUser.notificationSettings)
              : updatedUser.notificationSettings)
          };
        } catch {
          parsedSettings = DEFAULT_NOTIFICATION_SETTINGS;
        }
      } else {
        parsedSettings = DEFAULT_NOTIFICATION_SETTINGS;
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          ...parsedSettings
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Erro ao atualizar configurações',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('[POST /api/user/notifications] Unexpected error:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Erro inesperado',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

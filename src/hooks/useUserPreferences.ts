import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useUserPreferences() {
  const { data: session } = useSession();
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string>('sunday');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.firstDayOfWeek) {
            setFirstDayOfWeek(data.firstDayOfWeek);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session]);

  const updateFirstDayOfWeek = async (value: 'sunday' | 'monday') => {
    if (!session?.user?.email) return false;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstDayOfWeek: value }),
      });

      if (response.ok) {
        setFirstDayOfWeek(value);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    firstDayOfWeek,
    setFirstDayOfWeek: updateFirstDayOfWeek,
    isLoading,
    isUpdating,
  };
}

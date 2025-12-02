import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface FormattedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FormattedDateInput({ 
  value, 
  onChange, 
  placeholder = 'dd/mm/yyyy',
  className = ''
}: FormattedDateInputProps) {

  const [open, setOpen] = useState(false);

  /** 🔥 FUNÇÃO FINAL — limpa, sem problemas de fuso horário */
  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      onChange(formattedDate);
    } else {
      onChange('');
    }

    setOpen(false);
  };

  /** 🔥 Função segura que converte tanto ISO (YYYY-MM-DD) quanto DD/MM/YYYY */
  const selectedDate = (() => {
    try {
      if (!value) return null;

      // Quando já está no formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }

      // Quando está no formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, day);
      }

      // Qualquer outro formato
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;

    } catch {
      return null;
    }
  })();


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`w-full justify-start text-left font-normal ${className}`}
          onClick={() => setOpen(true)}
        >
          {selectedDate ? (
            format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(d) => handleDateChange(d ?? null)}
          initialFocus
          locale={ptBR}
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
}

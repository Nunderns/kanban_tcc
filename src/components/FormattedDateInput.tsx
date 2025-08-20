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

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-')
      onChange(formattedDate);
    } else {
      onChange('');
    }
    setOpen(false);
  };

  const selectedDate = (() => {
    try {
      if (!value) return null;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(value);
    } catch (e) {
      console.error('Error parsing date:', e);
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
        />
      </PopoverContent>
    </Popover>
  );
}

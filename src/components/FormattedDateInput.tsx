import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface FormattedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  fromDate?: Date;
}

export function FormattedDateInput({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  className = '',
  fromDate
}: FormattedDateInputProps) {

  const [open, setOpen] = useState(false);
  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return fromDate && fromDate > today ? fromDate : today;
  }, [fromDate]);
  const selectedDate = useMemo(() => {
    if (!value) return undefined;

    try {
      let date: Date;

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(value);
      }

      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  }, [value]);
  const handleSelect = (date: Date | undefined) => {
    if (!date) {
      onChange('');
      return;
    }
    const selected = date < minDate ? minDate : date;
    const formattedDate = [
      selected.getFullYear(),
      String(selected.getMonth() + 1).padStart(2, '0'),
      String(selected.getDate()).padStart(2, '0')
    ].join('-')

    onChange(formattedDate);
    setOpen(false);
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          {selectedDate ? (
            format(selectedDate, 'dd/MM/yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) => date < minDate}
          locale={ptBR}
          defaultMonth={selectedDate || minDate}
          fromDate={minDate}
          className="p-2"
          classNames={{
            months: "flex flex-col space-y-4",
            month: "space-y-2",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell:
              "text-muted-foreground w-9 font-normal text-xs",
            row: "flex w-full mt-1",
            cell:
              "h-9 w-9 text-center relative p-0 focus-within:relative",
            day:
              "h-9 w-9 p-0 text-sm hover:bg-accent hover:text-accent-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
            caption: "flex items-center justify-between px-2 pt-2",
            caption_label: "text-sm font-medium",
            nav: "flex items-center gap-1",
            nav_button:
              "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 text-primary",
          }}

        />
      </PopoverContent>
    </Popover>
  );
}

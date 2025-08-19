import { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

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
  const [displayValue, setDisplayValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    
    try {
      let date: Date;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } 
      else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } 
      else {
        date = new Date(value);
      }
      
      if (!isNaN(date.getTime())) {
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedYear = date.getFullYear();
        setDisplayValue(`${formattedDay}/${formattedMonth}/${formattedYear}`);
      } else {
        setDisplayValue('');
      }
    } catch (e) {
      console.error('Error parsing date:', e);
      setDisplayValue('');
    }
  }, [value]);

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-')
      
      const formattedDisplay = [
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        date.getFullYear()
      ].join('/')
      
      setDisplayValue(formattedDisplay);
      onChange(formattedDate);
    } else {
      setDisplayValue('');
      onChange('');
    }
    setShowDatePicker(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    
    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += input[i];
    }
    
    setDisplayValue(formatted);
    
    if (input.length === 8) {
      const day = parseInt(input.substring(0, 2), 10);
      const month = parseInt(input.substring(2, 4), 10) - 1;
      const year = parseInt(input.substring(4, 8), 10);
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        const formattedDate = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-')
        
        onChange(formattedDate);
      }
    } else if (input.length === 0) {
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'Decimal'].includes(e.key) ||
        (e.key === 'a' && e.ctrlKey === true) ||
        ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }
    
    if ((e.shiftKey || !/^[0-9]$/.test(e.key)) && !/^Numpad[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleFocus = () => {
    setShowDatePicker(true);
  };

  const handleBlur = () => {
    setShowDatePicker(false);
  };

  const selectedDate = value ? (() => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    return null;
  })() : null;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div 
        className="w-full p-2 border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => setShowDatePicker(!showDatePicker)}
      >
        {selectedDate ? (
          <span className="text-gray-900">
            {selectedDate.toLocaleDateString('pt-BR')}
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
      
      {showDatePicker && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            showPopperArrow={false}
            calendarClassName="border-0"
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            formatWeekDay={nameOfDay => nameOfDay.substring(0, 1).toUpperCase() + nameOfDay.substring(1, 3)}
            showWeekNumbers
            weekLabel="Sem"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </div>
      )}
    </div>
  );
}

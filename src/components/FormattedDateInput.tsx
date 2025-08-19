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
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    setShowDatePicker(false);
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

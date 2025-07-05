import { useState, useEffect, useRef } from 'react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when value prop changes
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    
    try {
      let date: Date;
      
      // Check if the value is in yyyy-MM-dd format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } 
      // Check if the value is in dd/MM/yyyy format
      else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } 
      // If format is not recognized, try parsing directly
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 8 digits (ddmmyyyy)
    if (input.length > 8) {
      input = input.substring(0, 8);
    }
    
    // Format with slashes
    let formatted = '';
    for (let i = 0; i < input.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += input[i];
    }
    
    setDisplayValue(formatted);
    
    // If we have a complete date, update the parent
    if (input.length === 8) {
      const day = parseInt(input.substring(0, 2), 10);
      const month = parseInt(input.substring(2, 4), 10) - 1; // JS months are 0-based
      const year = parseInt(input.substring(4, 8), 10);
      
      // Create date in local timezone
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        // Format as YYYY-MM-DD without timezone conversion
        const formattedDate = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-');
        
        onChange(formattedDate);
      }
    } else if (input.length === 0) {
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrows, home, end
    if (
      [46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
      (e.keyCode === 65 && e.ctrlKey === true) || // Ctrl+A
      (e.keyCode >= 35 && e.keyCode <= 40) // Home, End, Left, Right, Up, Down
    ) {
      return;
    }
    
    // Ensure it's a number and stop the keypress if not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={10} // dd/mm/yyyy
      className={className}
    />
  );
}

'use client';

import * as React from 'react';
import { Select } from './select';
import { cn } from '@/lib/utils';

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const;

interface DateFilterProps {
  selectedDay?: number;
  selectedMonth?: number;
  selectedYear?: number;
  onDayChange?: (day: number) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  showDay?: boolean;
  yearRange?: number; // How many years back from current year
  className?: string;
  selectClassName?: string;
}

export function DateFilter({
  selectedDay,
  selectedMonth,
  selectedYear,
  onDayChange,
  onMonthChange,
  onYearChange,
  showDay = false,
  yearRange = 6,
  className,
  selectClassName,
}: DateFilterProps) {
  const today = new Date();
  const currentDay = selectedDay ?? today.getDate();
  const currentMonth = selectedMonth ?? today.getMonth() + 1;
  const currentYear = selectedYear ?? today.getFullYear();
  
  const yearOptions = Array.from({ length: yearRange }, (_, i) => currentYear - i);
  
  // Calculate days in selected month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className={cn('flex gap-2', className)}>
      {showDay && onDayChange && (
        <Select
          value={currentDay.toString()}
          onChange={(e) => onDayChange(Number(e.target.value))}
          className={cn('w-full', selectClassName)}
        >
          <option value="">Day</option>
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      )}

      <Select
        value={currentMonth.toString()}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className={cn('w-full', selectClassName)}
      >
        {MONTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        value={currentYear.toString()}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className={cn('w-full', selectClassName)}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  );
}

// Legacy inline-style version (matches existing analytics page styling)
interface DateFilterInlineProps {
  selectedDay?: number;
  selectedMonth?: number;
  selectedYear?: number;
  onDayChange?: (day: number) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  showDay?: boolean;
  yearRange?: number;
  style?: React.CSSProperties;
}

export function DateFilterInline({
  selectedDay,
  selectedMonth,
  selectedYear,
  onDayChange,
  onMonthChange,
  onYearChange,
  showDay = false,
  yearRange = 6,
  style,
}: DateFilterInlineProps) {
  const today = new Date();
  const currentDay = selectedDay ?? today.getDate();
  const currentMonth = selectedMonth ?? today.getMonth() + 1;
  const currentYear = selectedYear ?? today.getFullYear();
  
  const yearOptions = Array.from({ length: yearRange }, (_, i) => currentYear - i);
  
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    padding: '0.45rem 0.7rem',
    fontSize: '0.82rem',
    ...style,
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {showDay && onDayChange && (
        <select
          value={currentDay}
          onChange={(e) => onDayChange(Number(e.target.value))}
          style={selectStyle}
        >
          <option value="">Day</option>
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      )}

      <select
        value={currentMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        style={selectStyle}
      >
        {MONTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={currentYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        style={selectStyle}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export { MONTH_OPTIONS };

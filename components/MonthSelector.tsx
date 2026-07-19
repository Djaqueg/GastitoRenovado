"use client";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
      <select
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="input-field w-auto min-w-0 !rounded-lg !px-2.5 !py-1.5 text-xs sm:min-w-[140px] sm:!rounded-xl sm:!px-4 sm:!py-2.5 sm:text-sm"
        aria-label="Mes"
      >
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="input-field w-auto min-w-0 !rounded-lg !px-2.5 !py-1.5 text-xs sm:min-w-[100px] sm:!rounded-xl sm:!px-4 sm:!py-2.5 sm:text-sm"
        aria-label="Año"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import {
  MONTH_PERIOD_MODE_LABELS,
  formatPeriodRange,
  type MonthPeriodMode,
} from "@/lib/month-period";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface MonthSelectorProps {
  month: number;
  year: number;
  periodMode: MonthPeriodMode;
  onChange: (month: number, year: number) => void;
  onPeriodModeChange: (mode: MonthPeriodMode) => void;
}

export function MonthSelector({
  month,
  year,
  periodMode,
  onChange,
  onPeriodModeChange,
}: MonthSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex w-full flex-col items-start gap-2 md:w-auto md:items-end">
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:items-center md:justify-end md:gap-3">
        <select
          value={periodMode}
          onChange={(e) => onPeriodModeChange(e.target.value as MonthPeriodMode)}
          className="input-field col-span-2 w-full text-sm md:col-span-1 md:w-auto md:min-w-[180px]"
          aria-label="Tipo de período"
        >
          {(Object.keys(MONTH_PERIOD_MODE_LABELS) as MonthPeriodMode[]).map(
            (mode) => (
              <option key={mode} value={mode}>
                {MONTH_PERIOD_MODE_LABELS[mode]}
              </option>
            )
          )}
        </select>
        <select
          value={month}
          onChange={(e) => onChange(Number(e.target.value), year)}
          className="input-field w-full md:w-auto md:min-w-[140px]"
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
          className="input-field w-full md:w-auto md:min-w-[100px]"
          aria-label="Año"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-gray-500">
        Período: {formatPeriodRange(month, year, periodMode)}
      </p>
    </div>
  );
}

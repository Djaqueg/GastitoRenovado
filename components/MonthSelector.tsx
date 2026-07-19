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
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <select
          value={periodMode}
          onChange={(e) => onPeriodModeChange(e.target.value as MonthPeriodMode)}
          className="input-field w-auto min-w-[180px] text-sm"
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
          className="input-field w-auto min-w-[140px]"
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
          className="input-field w-auto min-w-[100px]"
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

import { formatDate } from "./format";

export type MonthPeriodMode = "calendar" | "25to24";

export const MONTH_PERIOD_MODE_LABELS: Record<MonthPeriodMode, string> = {
  calendar: "Mes calendario (1 al 30/31)",
  "25to24": "Período 25 al 24",
};

const STORAGE_KEY = "gastito-month-period-mode";

export function isMonthPeriodMode(value: string): value is MonthPeriodMode {
  return value === "calendar" || value === "25to24";
}

export function getStoredMonthPeriodMode(): MonthPeriodMode {
  if (typeof window === "undefined") return "calendar";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && isMonthPeriodMode(stored) ? stored : "calendar";
}

export function setStoredMonthPeriodMode(mode: MonthPeriodMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export interface PeriodDateRange {
  from: string;
  to: string;
}

export function getPeriodDateRange(
  month: number,
  year: number,
  mode: MonthPeriodMode
): PeriodDateRange {
  if (mode === "calendar") {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      from: toIsoDate(year, month, 1),
      to: toIsoDate(year, month, lastDay),
    };
  }

  let startMonth = month - 1;
  let startYear = year;
  if (startMonth < 1) {
    startMonth = 12;
    startYear -= 1;
  }

  return {
    from: toIsoDate(startYear, startMonth, 25),
    to: toIsoDate(year, month, 24),
  };
}

export function movementBelongsToPeriod(
  fecha: string,
  month: number,
  year: number,
  mode: MonthPeriodMode
): boolean {
  const { from, to } = getPeriodDateRange(month, year, mode);
  return fecha >= from && fecha <= to;
}

export function getCurrentPeriodMonthYear(
  mode: MonthPeriodMode,
  referenceDate = new Date()
): { month: number; year: number } {
  let month = referenceDate.getMonth() + 1;
  let year = referenceDate.getFullYear();

  if (mode === "25to24" && referenceDate.getDate() >= 25) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { month, year };
}

export function getPreviousPeriod(
  month: number,
  year: number
): { month: number; year: number } {
  let previousMonth = month - 1;
  let previousYear = year;

  if (previousMonth < 1) {
    previousMonth = 12;
    previousYear -= 1;
  }

  return { month: previousMonth, year: previousYear };
}

export function formatPeriodRange(
  month: number,
  year: number,
  mode: MonthPeriodMode
): string {
  const { from, to } = getPeriodDateRange(month, year, mode);
  return `${formatDate(from)} - ${formatDate(to)}`;
}

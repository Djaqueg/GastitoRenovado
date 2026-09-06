import { formatDate } from "./format";
import { summarizeMovements } from "./summary";
import type { Movement, Summary } from "./types";

export interface CategoryBreakdown {
  categoria: string;
  total: number;
  count: number;
  porcentaje: number;
}

export interface MovementsReport {
  summary: Summary;
  expenses: CategoryBreakdown[];
  periodLabel: string;
  filtersLabel?: string;
}

export function getExpenseBreakdown(movements: Movement[]): CategoryBreakdown[] {
  const totals = new Map<string, { total: number; count: number }>();
  let grandTotal = 0;

  for (const movement of movements) {
    if (movement.tipo !== "Gasto") continue;

    const current = totals.get(movement.categoria) ?? { total: 0, count: 0 };
    current.total += movement.monto;
    current.count += 1;
    totals.set(movement.categoria, current);
    grandTotal += movement.monto;
  }

  return [...totals.entries()]
    .map(([categoria, { total, count }]) => ({
      categoria,
      total,
      count,
      porcentaje: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function describeActiveFilters(
  search: string,
  dateFrom: string,
  dateTo: string
): string | undefined {
  const parts: string[] = [];
  const query = search.trim();

  if (query) parts.push(`Búsqueda: "${query}"`);
  if (dateFrom) parts.push(`Desde: ${formatDate(dateFrom)}`);
  if (dateTo) parts.push(`Hasta: ${formatDate(dateTo)}`);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function buildMovementsReport(
  movements: Movement[],
  periodLabel: string,
  filtersLabel?: string
): MovementsReport {
  return {
    summary: summarizeMovements(movements),
    expenses: getExpenseBreakdown(movements),
    periodLabel,
    filtersLabel,
  };
}

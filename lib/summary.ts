import { movementBelongsToPeriod, type MonthPeriodMode } from "./month-period";
import type { Movement, Summary } from "./types";

export function filterMovementsByPeriod(
  movements: Movement[],
  month: number,
  year: number,
  mode: MonthPeriodMode
): Movement[] {
  return movements.filter((movement) =>
    movementBelongsToPeriod(movement.fecha, month, year, mode)
  );
}

export function summarizeMovements(movements: Movement[]): Summary {
  let ingresos = 0;
  let gastos = 0;

  for (const movement of movements) {
    if (movement.tipo === "Ingreso") {
      ingresos += movement.monto;
    } else if (movement.tipo === "Gasto") {
      gastos += movement.monto;
    }
  }

  return {
    ingresos,
    gastos,
    balance: ingresos - gastos,
  };
}

export function computeSummary(
  movements: Movement[],
  month: number,
  year: number,
  mode: MonthPeriodMode
): Summary {
  return summarizeMovements(
    filterMovementsByPeriod(movements, month, year, mode)
  );
}

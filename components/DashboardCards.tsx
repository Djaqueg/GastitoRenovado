"use client";

import { Card } from "./ui/Card";
import { formatCLP } from "@/lib/format";
import type { Summary } from "@/lib/types";

interface DashboardCardsProps {
  summary: Summary;
  loading?: boolean;
  periodLabel?: string;
}

export function DashboardCards({
  summary,
  loading,
  periodLabel = "del mes seleccionado",
}: DashboardCardsProps) {
  const balancePositive = summary.balance >= 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-28 animate-pulse bg-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
        <p className="mt-2 text-3xl font-bold text-primary">
          {formatCLP(summary.ingresos)}
        </p>
        <p className="mt-1 text-xs text-gray-400">{periodLabel}</p>
      </Card>

      <Card>
        <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
        <p className="mt-2 text-3xl font-bold text-amber-600">
          {formatCLP(summary.gastos)}
        </p>
        <p className="mt-1 text-xs text-gray-400">{periodLabel}</p>
      </Card>

      <Card highlighted>
        <p className="text-sm font-medium text-primary-mint">Balance</p>
        <p
          className={`mt-2 text-3xl font-bold ${
            balancePositive ? "text-white" : "text-red-300"
          }`}
        >
          {formatCLP(summary.balance)}
        </p>
        <p className="mt-1 text-xs text-primary-mint/80">
          {balancePositive ? "Saldo positivo" : "Saldo negativo"}
        </p>
      </Card>
    </div>
  );
}

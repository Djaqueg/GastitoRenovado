"use client";

import { Card } from "./ui/Card";
import { formatCLP } from "@/lib/format";
import type { PaymentChecklistStatus } from "@/lib/payment-checklist";

interface PaymentsPanelProps {
  items: PaymentChecklistStatus[];
  loading: boolean;
}

export function PaymentsPanel({ items, loading }: PaymentsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card h-16 animate-pulse rounded-2xl bg-gray-50" />
        ))}
      </div>
    );
  }

  const paidCount = items.filter((item) => item.paid).length;
  const totalCount = items.length;
  const allPaid = paidCount === totalCount;

  return (
    <div className="space-y-6">
      <Card className={allPaid ? "!border-green-200 !bg-green-50" : ""}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Progreso del mes</p>
            <p className="text-2xl font-bold text-gray-900">
              {paidCount} de {totalCount} pagados
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
              allPaid
                ? "bg-green-500 text-white"
                : "bg-primary-mint text-primary"
            }`}
          >
            {Math.round((paidCount / totalCount) * 100)}%
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${
              allPaid ? "bg-green-500" : "bg-primary"
            }`}
            style={{ width: `${(paidCount / totalCount) * 100}%` }}
          />
        </div>
      </Card>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Card
              className={`!p-4 transition-colors ${
                item.paid ? "!border-green-200 !bg-green-50/50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                    item.paid
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {item.paid && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium ${
                      item.paid ? "text-green-800" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.paid && item.movement && (
                    <p className="text-sm text-green-700">
                      Pagado · {formatCLP(item.movement.monto)} ·{" "}
                      {item.movement.fecha}
                    </p>
                  )}
                  {!item.paid && (
                    <p className="text-sm text-gray-500">Pendiente de pago</p>
                  )}
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    item.paid
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.paid ? "Listo" : "Pendiente"}
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-400">
        Los pagos se marcan automáticamente al registrar un gasto con la
        categoría correspondiente en el período seleccionado.
      </p>
    </div>
  );
}

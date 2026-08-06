"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { MonthSelector } from "@/components/MonthSelector";
import { PaymentsPanel } from "@/components/PaymentsPanel";
import { MovementFormModal } from "@/components/MovementFormModal";
import { fetchMovements } from "@/lib/gas-client";
import { filterMovementsByPeriod } from "@/lib/summary";
import { getPaymentChecklistStatus } from "@/lib/payment-checklist";
import {
  useCurrentPeriodSelection,
  useMonthPeriodMode,
} from "@/lib/use-month-period-mode";
import type { PaymentChecklistStatus } from "@/lib/payment-checklist";

export default function PagosPage() {
  const { mode: periodMode, setMode: setPeriodMode, isReady } =
    useMonthPeriodMode();
  const { month, year, setMonth, setYear } = useCurrentPeriodSelection(
    periodMode,
    isReady
  );
  const [items, setItems] = useState<PaymentChecklistStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!isReady) return;

    setLoading(true);
    setError("");

    try {
      const movementsData = await fetchMovements(500);
      const periodMovements = filterMovementsByPeriod(
        movementsData,
        month,
        year,
        periodMode
      );
      setItems(getPaymentChecklistStatus(periodMovements));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los pagos. Verifica la configuración de Google Sheets."
      );
    } finally {
      setLoading(false);
    }
  }, [isReady, month, year, periodMode]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return (
    <AuthGate>
      <AppShell
        title="Pagos"
        subtitle="Control de cuentas y obligaciones mensuales"
        onNewMovement={() => setModalOpen(true)}
        headerExtra={
          <MonthSelector
            month={month}
            year={year}
            periodMode={periodMode}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
            onPeriodModeChange={setPeriodMode}
          />
        }
      >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <PaymentsPanel items={items} loading={loading} />
      </AppShell>

      <MovementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadPayments}
      />
    </AuthGate>
  );
}

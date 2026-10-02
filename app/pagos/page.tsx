"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { MonthSelector } from "@/components/MonthSelector";
import { PaymentsPanel } from "@/components/PaymentsPanel";
import { MovementFormModal } from "@/components/MovementFormModal";
import { fetchMovements } from "@/lib/gas-client";
import { isAbortError } from "@/lib/gas-upstream";
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
  const { month, year, setMonth, setYear, isPeriodReady } =
    useCurrentPeriodSelection(periodMode, isReady);
  const [items, setItems] = useState<PaymentChecklistStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadPayments = useCallback(async (signal?: AbortSignal) => {
    if (!isPeriodReady) return;

    setLoading(true);
    setError("");

    try {
      const movementsData = await fetchMovements(
        500,
        month,
        year,
        periodMode,
        signal
      );
      if (signal?.aborted) return;
      const periodMovements = filterMovementsByPeriod(
        movementsData,
        month,
        year,
        periodMode
      );
      setItems(getPaymentChecklistStatus(periodMovements));
    } catch (err) {
      if (isAbortError(err) || signal?.aborted) return;
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los pagos. Verifica la configuración de Google Sheets."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [isPeriodReady, month, year, periodMode]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPayments(controller.signal);
    return () => controller.abort();
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

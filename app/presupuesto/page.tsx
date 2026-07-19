"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { MonthSelector } from "@/components/MonthSelector";
import { BudgetPanel } from "@/components/BudgetPanel";
import { MovementFormModal } from "@/components/MovementFormModal";
import { fetchBudgetStatus } from "@/lib/gas-client";
import {
  useCurrentPeriodSelection,
  useMonthPeriodMode,
} from "@/lib/use-month-period-mode";
import type { BudgetStatus } from "@/lib/types";

export default function PresupuestoPage() {
  const { mode: periodMode, setMode: setPeriodMode, isReady } =
    useMonthPeriodMode();
  const { month, year, setMonth, setYear } = useCurrentPeriodSelection(
    periodMode,
    isReady
  );
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadBudgets = useCallback(async () => {
    if (!isReady) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchBudgetStatus(month, year, periodMode);
      setBudgets(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los presupuestos. Verifica la configuración de Google Sheets."
      );
    } finally {
      setLoading(false);
    }
  }, [isReady, month, year, periodMode]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  return (
    <AuthGate>
      <AppShell
        title="Presupuesto"
        subtitle="Configura y controla el gasto máximo por categoría"
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

        <BudgetPanel
          budgets={budgets}
          loading={loading}
          onRefresh={loadBudgets}
        />
      </AppShell>

      <MovementFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadBudgets}
      />
    </AuthGate>
  );
}

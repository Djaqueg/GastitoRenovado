"use client";



import { useState, useEffect, useCallback } from "react";

import { AuthGate } from "@/components/AuthGate";

import { AppShell } from "@/components/AppShell";

import { DashboardCards } from "@/components/DashboardCards";

import { MonthSelector } from "@/components/MonthSelector";

import { MovementsTable } from "@/components/MovementsTable";

import { MovementFormModal } from "@/components/MovementFormModal";

import {

  fetchSummary,

  fetchMovements,

  deleteMovement,

} from "@/lib/gas-client";

import { formatPeriodRange } from "@/lib/month-period";

import {
  useCurrentPeriodSelection,
  useMonthPeriodMode,
} from "@/lib/use-month-period-mode";

import type { Movement, Summary } from "@/lib/types";



export default function HomePage() {

  const { mode: periodMode, setMode: setPeriodMode, isReady } =
    useMonthPeriodMode();

  const { month, year, setMonth, setYear } = useCurrentPeriodSelection(
    periodMode,
    isReady
  );

  const [summary, setSummary] = useState<Summary>({

    ingresos: 0,

    gastos: 0,

    balance: 0,

  });

  const [movements, setMovements] = useState<Movement[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(true);

  const [loadingMovements, setLoadingMovements] = useState(true);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);



  const loadData = useCallback(async () => {

    if (!isReady) return;

    setLoadingSummary(true);

    setLoadingMovements(true);

    setError("");



    try {

      const [summaryData, movementsData] = await Promise.all([

        fetchSummary(month, year, periodMode),

        fetchMovements(500),

      ]);

      setSummary(summaryData);

      setMovements(movementsData);

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : "Error al cargar los datos. Verifica la configuración de Google Sheets."

      );

    } finally {

      setLoadingSummary(false);

      setLoadingMovements(false);

    }

  }, [isReady, month, year, periodMode]);



  useEffect(() => {

    loadData();

  }, [loadData]);



  function handleNewMovement() {

    setEditingMovement(null);

    setModalOpen(true);

  }



  function handleEdit(movement: Movement) {

    setEditingMovement(movement);

    setModalOpen(true);

  }



  async function handleDelete(movement: Movement) {

    const confirmed = window.confirm(

      `¿Eliminar el movimiento "${movement.categoria} - ${movement.subcategoria}" por ${movement.monto}?`

    );

    if (!confirmed) return;



    try {

      await deleteMovement(movement.id);

      await loadData();

    } catch (err) {

      alert(

        err instanceof Error ? err.message : "Error al eliminar el movimiento"

      );

    }

  }



  function handleModalClose() {

    setModalOpen(false);

    setEditingMovement(null);

  }



  return (

    <AuthGate>

      <AppShell

        title="Dashboard"

        subtitle="Resumen financiero del hogar"

        onNewMovement={handleNewMovement}

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



        <div className="mb-8">

          <DashboardCards
            summary={summary}
            loading={loadingSummary}
            periodLabel={formatPeriodRange(month, year, periodMode)}
          />

        </div>



        <MovementsTable

          movements={movements}

          loading={loadingMovements}

          periodMode={periodMode}

          onEdit={handleEdit}

          onDelete={handleDelete}

        />

      </AppShell>



      <MovementFormModal

        open={modalOpen}

        onClose={handleModalClose}

        onSuccess={loadData}

        movement={editingMovement}

      />

    </AuthGate>

  );

}



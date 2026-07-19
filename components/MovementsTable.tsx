"use client";

import { useMemo, useState } from "react";
import { formatCLP, formatDate } from "@/lib/format";
import {
  getCurrentPeriodMonthYear,
  getPeriodDateRange,
  getPreviousPeriod,
  type MonthPeriodMode,
} from "@/lib/month-period";
import type { Movement } from "@/lib/types";
import { Button } from "./ui/Button";
import { RowActionsMenu } from "./RowActionsMenu";

interface MovementsTableProps {
  movements: Movement[];
  loading?: boolean;
  periodMode?: MonthPeriodMode;
  onEdit: (movement: Movement) => void;
  onDelete: (movement: Movement) => void;
}

function getLastPeriodRange(
  month: number,
  year: number,
  periodMode: MonthPeriodMode
) {
  const previous = getPreviousPeriod(month, year);
  return getPeriodDateRange(previous.month, previous.year, periodMode);
}

function matchesSearch(movement: Movement, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    movement.fecha,
    movement.tipo,
    movement.categoria,
    movement.subcategoria,
    movement.medio_pago,
    movement.detalle,
    String(movement.monto),
    formatCLP(movement.monto),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesDateRange(
  fecha: string,
  from: string,
  to: string
): boolean {
  if (from && fecha < from) return false;
  if (to && fecha > to) return false;
  return true;
}

export function MovementsTable({
  movements,
  loading,
  periodMode = "calendar",
  onEdit,
  onDelete,
}: MovementsTableProps) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredMovements = useMemo(() => {
    return movements.filter(
      (m) =>
        matchesSearch(m, search) &&
        matchesDateRange(m.fecha, dateFrom, dateTo)
    );
  }, [movements, search, dateFrom, dateTo]);

  const hasFilters = search !== "" || dateFrom !== "" || dateTo !== "";

  function applyLastMonth() {
    const { month, year } = getCurrentPeriodMonthYear(periodMode);
    const { from, to } = getLastPeriodRange(month, year, periodMode);
    setDateFrom(from);
    setDateTo(to);
    setSearch("");
    setFiltersOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
  }

  if (loading) {
    return (
      <div className="card">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Últimos Movimientos
            </h2>
            <p className="text-sm text-gray-500">
              {hasFilters
                ? `${filteredMovements.length} de ${movements.length} movimientos`
                : `${movements.length} movimientos registrados`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="!px-3 !py-2 text-sm"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="movements-filters"
            >
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
                {hasFilters && (
                  <span className="h-2 w-2 rounded-full bg-primary" />
                )}
              </span>
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div id="movements-filters" className="mt-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="!px-3 !py-2 text-sm"
                onClick={applyLastMonth}
              >
                Último mes
              </Button>
              {hasFilters && (
                <Button
                  variant="secondary"
                  className="!px-3 !py-2 text-sm"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="label-field" htmlFor="movements-search">
              Buscar
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id="movements-search"
                type="search"
                className="input-field pl-10"
                placeholder="Categoría, detalle, monto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="movements-date-from">
              Desde
            </label>
            <input
              id="movements-date-from"
              type="date"
              className="input-field"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field" htmlFor="movements-date-to">
              Hasta
            </label>
            <input
              id="movements-date-to"
              type="date"
              className="input-field"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
            </div>
          </div>
        )}
      </div>

      {filteredMovements.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">
            {movements.length === 0
              ? "No hay movimientos registrados aún."
              : "No se encontraron movimientos con los filtros aplicados."}
          </p>
          {movements.length === 0 ? (
            <p className="mt-1 text-sm text-gray-400">
              Usa el botón &quot;Nuevo movimiento&quot; para agregar el primero.
            </p>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 font-medium text-gray-500">Fecha</th>
                <th className="px-6 py-3 font-medium text-gray-500">Tipo</th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Categoría
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Subcategoría
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">Monto</th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Medio de Pago
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">Detalle</th>
                <th className="px-6 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMovements.map((m) => (
                <tr
                  key={m.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-3.5 text-gray-700">
                    {formatDate(m.fecha)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.tipo === "Ingreso"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-700">{m.categoria}</td>
                  <td className="px-6 py-3.5 text-gray-500">
                    {m.subcategoria}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gray-900">
                    {formatCLP(m.monto)}
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{m.medio_pago}</td>
                  <td className="max-w-[200px] truncate px-6 py-3.5 text-gray-500">
                    {m.detalle || "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3.5">
                    <RowActionsMenu
                      onEdit={() => onEdit(m)}
                      onDelete={() => onDelete(m)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

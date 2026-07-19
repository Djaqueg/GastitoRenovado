"use client";

import { useMemo, useState } from "react";
import { formatCLP, formatDate } from "@/lib/format";
import type { Movement } from "@/lib/types";
import { RowActionsMenu } from "./RowActionsMenu";

interface MovementsTableProps {
  movements: Movement[];
  loading?: boolean;
  onEdit: (movement: Movement) => void;
  onDelete: (movement: Movement) => void;
}

function getLastMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
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

  const hasDateFilters = dateFrom !== "" || dateTo !== "";
  const hasFilters = search !== "" || hasDateFilters;
  const showFilters = filtersOpen || hasDateFilters;

  function applyLastMonth() {
    const { from, to } = getLastMonthRange();
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
      <div className="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Últimos Movimientos
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              {hasFilters
                ? `${filteredMovements.length} de ${movements.length} movimientos`
                : `${movements.length} movimientos registrados`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:hidden ${
                showFilters
                  ? "bg-primary-mint text-primary"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              aria-expanded={showFilters}
              aria-controls="movements-filters"
            >
              <svg
                className="h-3.5 w-3.5"
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
              {hasDateFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={applyLastMonth}
              className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:inline-flex"
            >
              Último mes
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800 sm:inline-flex"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="relative">
            <label className="sr-only" htmlFor="movements-search">
              Buscar
            </label>
            <svg
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:left-3 sm:h-4 sm:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
              className="input-field !rounded-lg !py-2 !pl-8 !pr-3 text-sm sm:!rounded-xl sm:!py-2.5 sm:!pl-10 sm:!pr-4"
              placeholder="Buscar por categoría, detalle, monto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div
            id="movements-filters"
            className={`mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-2 sm:gap-3 lg:grid-cols-2 ${
              showFilters ? "grid" : "hidden sm:grid"
            }`}
          >
            <div>
              <label
                className="mb-1 hidden text-xs font-medium text-gray-500 sm:block"
                htmlFor="movements-date-from"
              >
                Desde
              </label>
              <input
                id="movements-date-from"
                type="date"
                className="input-field !rounded-lg !px-2.5 !py-1.5 text-xs sm:!rounded-xl sm:!px-4 sm:!py-2.5 sm:text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Desde"
              />
            </div>

            <div>
              <label
                className="mb-1 hidden text-xs font-medium text-gray-500 sm:block"
                htmlFor="movements-date-to"
              >
                Hasta
              </label>
              <input
                id="movements-date-to"
                type="date"
                className="input-field !rounded-lg !px-2.5 !py-1.5 text-xs sm:!rounded-xl sm:!px-4 sm:!py-2.5 sm:text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Hasta"
              />
            </div>

            <div className="col-span-2 flex items-center gap-1 sm:hidden">
              <button
                type="button"
                onClick={applyLastMonth}
                className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                Último mes
              </button>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
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

"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { formatCLP } from "@/lib/format";
import { EXPENSE_CATEGORY_LIST } from "@/lib/categories";
import { saveBudget } from "@/lib/gas-client";
import type { BudgetStatus } from "@/lib/types";

interface BudgetPanelProps {
  budgets: BudgetStatus[];
  loading: boolean;
  onRefresh: () => void;
}

export function BudgetPanel({ budgets, loading, onRefresh }: BudgetPanelProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [addingCategory, setAddingCategory] = useState("");
  const [addingValue, setAddingValue] = useState("");
  const [error, setError] = useState("");

  const configuredCategories = new Set(budgets.map((b) => b.categoria));
  const availableCategories = EXPENSE_CATEGORY_LIST.filter(
    (cat) => !configuredCategories.has(cat)
  );

  async function handleSave(categoria: string, value: string) {
    const amount = Number(value);
    if (!value || isNaN(amount) || amount < 0) {
      setError("Ingresa un monto válido (0 o mayor)");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveBudget(categoria, amount);
      setEditingCategory(null);
      setAddingCategory("");
      setAddingValue("");
      onRefresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el presupuesto"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-24 animate-pulse bg-gray-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {budgets.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">
            Aún no has configurado presupuestos. Agrega uno abajo para empezar
            a controlar tus gastos por categoría.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const isEditing = editingCategory === budget.categoria;
            const progress = Math.min(budget.porcentaje, 100);

            return (
              <Card key={budget.categoria}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {budget.categoria}
                      </h3>
                      {budget.excedido && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Excedido
                        </span>
                      )}
                      {!budget.excedido && budget.porcentaje >= 80 && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Cerca del límite
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-gray-600">
                          Gastado:{" "}
                          <span className="font-medium text-gray-900">
                            {formatCLP(budget.gastado)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Máximo:{" "}
                          <span className="font-medium text-gray-900">
                            {formatCLP(budget.presupuesto_maximo)}
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            budget.excedido
                              ? "bg-red-500"
                              : budget.porcentaje >= 80
                                ? "bg-amber-500"
                                : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {budget.excedido
                          ? `Te pasaste por ${formatCLP(Math.abs(budget.restante))}`
                          : `Quedan ${formatCLP(budget.restante)} (${budget.porcentaje}% usado)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          className="input-field !w-36"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Monto máximo"
                        />
                        <Button
                          disabled={saving}
                          onClick={() =>
                            handleSave(budget.categoria, editValue)
                          }
                          className="!px-3"
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingCategory(null)}
                          className="!px-3"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingCategory(budget.categoria);
                          setEditValue(String(budget.presupuesto_maximo));
                          setError("");
                        }}
                        className="!px-3"
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {availableCategories.length > 0 && (
        <Card>
          <h3 className="mb-4 font-semibold text-gray-900">
            Agregar presupuesto
          </h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="label-field" htmlFor="new-budget-category">
                Categoría de gasto
              </label>
              <select
                id="new-budget-category"
                className="input-field"
                value={addingCategory}
                onChange={(e) => setAddingCategory(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px]">
              <label className="label-field" htmlFor="new-budget-amount">
                Presupuesto máximo
              </label>
              <input
                id="new-budget-amount"
                type="number"
                min={0}
                step={1000}
                className="input-field"
                value={addingValue}
                onChange={(e) => setAddingValue(e.target.value)}
                placeholder="Ej: 150000"
              />
            </div>
            <Button
              disabled={saving || !addingCategory}
              onClick={() => handleSave(addingCategory, addingValue)}
            >
              {saving ? "Guardando..." : "Agregar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

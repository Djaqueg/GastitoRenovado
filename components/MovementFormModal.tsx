"use client";



import { useState, useEffect, FormEvent } from "react";

import { Modal } from "./ui/Modal";

import { Button } from "./ui/Button";

import {

  getCategoriesForType,

  getSubcategoriesForType,

  hasSubcategories,

  PAYMENT_METHODS,

  resolveSubcategoria,

} from "@/lib/categories";

import type { Movement, MovementInput, MovementType } from "@/lib/types";

import { createMovement, updateMovement } from "@/lib/gas-client";



interface MovementFormModalProps {

  open: boolean;

  onClose: () => void;

  onSuccess: () => void;

  movement?: Movement | null;

}



const EMPTY_FORM: MovementInput = {

  fecha: new Date().toISOString().split("T")[0],

  tipo: "Gasto",

  categoria: "",

  subcategoria: "",

  monto: 0,

  medio_pago: "Tarjeta de débito",

  detalle: "",

};



export function MovementFormModal({

  open,

  onClose,

  onSuccess,

  movement,

}: MovementFormModalProps) {

  const [form, setForm] = useState<MovementInput>(EMPTY_FORM);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  const [submitError, setSubmitError] = useState("");



  const isEditing = !!movement;

  const categories = getCategoriesForType(form.tipo);

  const subcategories = form.categoria

    ? getSubcategoriesForType(form.categoria, form.tipo)

    : [];

  const showSubcategory =

    form.tipo === "Gasto" && hasSubcategories(form.categoria, form.tipo);



  useEffect(() => {

    if (open) {

      if (movement) {

        setForm({

          fecha: movement.fecha,

          tipo: movement.tipo,

          categoria: movement.categoria,

          subcategoria: movement.subcategoria,

          monto: movement.monto,

          medio_pago: movement.medio_pago,

          detalle: movement.detalle,

        });

      } else {

        setForm({

          ...EMPTY_FORM,

          fecha: new Date().toISOString().split("T")[0],

        });

      }

      setErrors({});

      setSubmitError("");

    }

  }, [open, movement]);



  function validate(): boolean {

    const newErrors: Record<string, string> = {};



    if (!form.fecha) newErrors.fecha = "La fecha es requerida";

    if (!form.categoria) newErrors.categoria = "La categoría es requerida";

    if (

      form.tipo === "Gasto" &&

      hasSubcategories(form.categoria, form.tipo) &&

      !form.subcategoria

    ) {

      newErrors.subcategoria = "La subcategoría es requerida";

    }

    if (!form.monto || form.monto <= 0)

      newErrors.monto = "El monto debe ser mayor a 0";

    if (!form.medio_pago) newErrors.medio_pago = "El medio de pago es requerido";



    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  }



  async function handleSubmit(e: FormEvent) {

    e.preventDefault();

    if (!validate()) return;



    setLoading(true);

    setSubmitError("");



    const payload: MovementInput = {

      ...form,

      subcategoria: resolveSubcategoria(

        form.categoria,

        form.subcategoria,

        form.tipo

      ),

    };



    try {

      if (isEditing && movement) {

        await updateMovement(movement.id, payload);

      } else {

        await createMovement(payload);

      }

      onSuccess();

      onClose();

    } catch (err) {

      setSubmitError(

        err instanceof Error ? err.message : "Error al guardar el movimiento"

      );

    } finally {

      setLoading(false);

    }

  }



  function updateField<K extends keyof MovementInput>(

    key: K,

    value: MovementInput[K]

  ) {

    setForm((prev) => {

      const next = { ...prev, [key]: value };

      if (key === "tipo") {

        next.categoria = "";

        next.subcategoria = "";

      }

      if (key === "categoria") {

        next.subcategoria = "";

      }

      return next;

    });

  }



  return (

    <Modal

      open={open}

      onClose={onClose}

      title={isEditing ? "Editar Movimiento" : "Nuevo Movimiento"}

    >

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="label-field" htmlFor="fecha">

              Fecha

            </label>

            <input

              id="fecha"

              type="date"

              className="input-field"

              value={form.fecha}

              onChange={(e) => updateField("fecha", e.target.value)}

            />

            {errors.fecha && (

              <p className="mt-1 text-xs text-red-600">{errors.fecha}</p>

            )}

          </div>



          <div>

            <label className="label-field" htmlFor="tipo">

              Tipo

            </label>

            <select

              id="tipo"

              className="input-field"

              value={form.tipo}

              onChange={(e) =>

                updateField("tipo", e.target.value as MovementType)

              }

            >

              <option value="Ingreso">Ingreso</option>

              <option value="Gasto">Gasto</option>

            </select>

          </div>

        </div>



        <div className={`grid gap-4 ${showSubcategory ? "grid-cols-2" : "grid-cols-1"}`}>

          <div>

            <label className="label-field" htmlFor="categoria">

              Categoría

            </label>

            <select

              id="categoria"

              className="input-field"

              value={form.categoria}

              onChange={(e) => updateField("categoria", e.target.value)}

            >

              <option value="">Seleccionar...</option>

              {categories.map((cat) => (

                <option key={cat} value={cat}>

                  {cat}

                </option>

              ))}

            </select>

            {errors.categoria && (

              <p className="mt-1 text-xs text-red-600">{errors.categoria}</p>

            )}

          </div>



          {showSubcategory && (

            <div>

              <label className="label-field" htmlFor="subcategoria">

                Subcategoría

              </label>

              <select

                id="subcategoria"

                className="input-field"

                value={form.subcategoria}

                onChange={(e) => updateField("subcategoria", e.target.value)}

                disabled={!form.categoria}

              >

                <option value="">Seleccionar...</option>

                {subcategories.map((sub) => (

                  <option key={sub} value={sub}>

                    {sub}

                  </option>

                ))}

              </select>

              {errors.subcategoria && (

                <p className="mt-1 text-xs text-red-600">

                  {errors.subcategoria}

                </p>

              )}

            </div>

          )}

        </div>



        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="label-field" htmlFor="monto">

              Monto

            </label>

            <input

              id="monto"

              type="number"

              min={1}

              step={1}

              className="input-field"

              value={form.monto || ""}

              onChange={(e) => updateField("monto", Number(e.target.value))}

              placeholder="0"

            />

            {errors.monto && (

              <p className="mt-1 text-xs text-red-600">{errors.monto}</p>

            )}

          </div>



          <div>

            <label className="label-field" htmlFor="medio_pago">

              Medio de Pago

            </label>

            <select

              id="medio_pago"

              className="input-field"

              value={form.medio_pago}

              onChange={(e) => updateField("medio_pago", e.target.value)}

            >

              {PAYMENT_METHODS.map((m) => (

                <option key={m} value={m}>

                  {m}

                </option>

              ))}

            </select>

            {errors.medio_pago && (

              <p className="mt-1 text-xs text-red-600">{errors.medio_pago}</p>

            )}

          </div>

        </div>



        <div>

          <label className="label-field" htmlFor="detalle">

            Detalle

          </label>

          <textarea

            id="detalle"

            className="input-field min-h-[80px] resize-y"

            value={form.detalle}

            onChange={(e) => updateField("detalle", e.target.value)}

            placeholder="Descripción opcional del movimiento..."

          />

        </div>



        {submitError && (

          <p className="text-sm text-red-600">{submitError}</p>

        )}



        <div className="flex justify-end gap-3 pt-2">

          <Button type="button" variant="secondary" onClick={onClose}>

            Cancelar

          </Button>

          <Button type="submit" disabled={loading}>

            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}

          </Button>

        </div>

      </form>

    </Modal>

  );

}



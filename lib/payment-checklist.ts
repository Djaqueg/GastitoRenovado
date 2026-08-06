import type { Movement } from "./types";

export interface PaymentChecklistItem {
  id: string;
  label: string;
  categoria: string;
  subcategoria: string | null;
}

export const PAYMENT_CHECKLIST_ITEMS: PaymentChecklistItem[] = [
  { id: "arriendo", label: "Arriendo", categoria: "Arriendo", subcategoria: null },
  {
    id: "movistar",
    label: "Cuenta Movistar",
    categoria: "Cuentas",
    subcategoria: "Cuenta movistar",
  },
  {
    id: "entel",
    label: "Cuenta Entel",
    categoria: "Cuentas",
    subcategoria: "Cuenta entel",
  },
  {
    id: "credito-chile",
    label: "Crédito Chile",
    categoria: "Bancos",
    subcategoria: "Créditos",
  },
  {
    id: "credito-auto",
    label: "Crédito automotriz",
    categoria: "Auto",
    subcategoria: "Crédito",
  },
  {
    id: "cmr",
    label: "CMR",
    categoria: "Casas Comerciales",
    subcategoria: "Pago cuota",
  },
  {
    id: "seguro-auto",
    label: "Seguro automotriz",
    categoria: "Auto",
    subcategoria: "Seguro",
  },
  {
    id: "agua",
    label: "Cuenta agua",
    categoria: "Cuentas",
    subcategoria: "Cuenta agua",
  },
  {
    id: "luz",
    label: "Cuenta luz",
    categoria: "Cuentas",
    subcategoria: "Cuenta luz",
  },
  {
    id: "tag",
    label: "TAG",
    categoria: "Cuentas",
    subcategoria: "TAG",
  },
];

export interface PaymentChecklistStatus {
  id: string;
  label: string;
  paid: boolean;
  movement?: Movement;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function movementMatchesItem(movement: Movement, item: PaymentChecklistItem): boolean {
  if (movement.tipo !== "Gasto") return false;
  if (normalize(movement.categoria) !== normalize(item.categoria)) return false;

  if (item.subcategoria === null) return true;

  return normalize(movement.subcategoria) === normalize(item.subcategoria);
}

export function getPaymentChecklistStatus(
  movements: Movement[]
): PaymentChecklistStatus[] {
  const expenses = movements.filter((m) => m.tipo === "Gasto");

  return PAYMENT_CHECKLIST_ITEMS.map((item) => {
    const movement = expenses.find((m) => movementMatchesItem(m, item));
    return {
      id: item.id,
      label: item.label,
      paid: movement !== undefined,
      movement,
    };
  });
}

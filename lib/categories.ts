export const PAYMENT_METHODS = [
  "Tarjeta de débito",
  "Tarjeta de crédito BCH",
  "Tarjeta de crédito Santander",
  "Línea de crédito",
  "Pluxee",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Categorías de gasto con sus subcategorías (vacío = sin subcategorías) */
export const EXPENSE_CATEGORIES: Record<string, string[]> = {
  Arriendo: [],
  Supermercado: ["Carnicería", "Huevos y paltas"],
  "Feria/Verdulería": [],
  Cuentas: [
    "Cuenta agua",
    "Cuenta luz",
    "Cuenta gas",
    "Cuenta leña",
    "Cuenta movistar",
    "Cuenta entel",
    "TAG",
  ],
  "Médico/Farmacia": ["Pago HELP", "Consulta médica", "Farmacia", "Otros"],
  Mascotas: [
    "Arena de gatos",
    "Comida de gatos",
    "Comida de perros",
    "Veterinario",
  ],
  Bancos: ["Mantención tarjeta", "Créditos", "Intereses"],
  "Casas Comerciales": ["Pago cuota", "Mantención tarjeta"],
  Ocio: ["Pago mensualidad", "Otros"],
  Auto: [
    "Seguro",
    "Crédito",
    "Bencina",
    "Mantención",
    "Permiso de circulación",
    "SOAP",
  ],
  Almacenes: [],
  Extras: [],
};

export const INCOME_CATEGORIES = ["Sueldo", "Aguinaldo", "Depósitos"] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LIST = Object.keys(EXPENSE_CATEGORIES);

export function getExpenseSubcategories(categoria: string): string[] {
  return EXPENSE_CATEGORIES[categoria] ?? [];
}

export function hasSubcategories(categoria: string, tipo: "Gasto" | "Ingreso"): boolean {
  if (tipo === "Ingreso") return false;
  return getExpenseSubcategories(categoria).length > 0;
}

export function getCategoriesForType(tipo: "Gasto" | "Ingreso"): string[] {
  return tipo === "Ingreso" ? [...INCOME_CATEGORIES] : EXPENSE_CATEGORY_LIST;
}

export function getSubcategoriesForType(
  categoria: string,
  tipo: "Gasto" | "Ingreso"
): string[] {
  if (tipo === "Ingreso") return [];
  return getExpenseSubcategories(categoria);
}

/** Resuelve la subcategoría final al guardar (categorías sin subs usan el nombre de la categoría) */
export function resolveSubcategoria(
  categoria: string,
  subcategoria: string,
  tipo: "Gasto" | "Ingreso"
): string {
  if (tipo === "Ingreso") return categoria;
  if (hasSubcategories(categoria, tipo)) return subcategoria;
  return categoria;
}

export type MovementType = "Ingreso" | "Gasto";

export interface Movement {
  id: string;
  fecha: string;
  tipo: MovementType;
  categoria: string;
  subcategoria: string;
  monto: number;
  medio_pago: string;
  detalle: string;
  fecha_registro: string;
}

export interface MovementInput {
  fecha: string;
  tipo: MovementType;
  categoria: string;
  subcategoria: string;
  monto: number;
  medio_pago: string;
  detalle: string;
}

export interface Summary {
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface GasResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Budget {
  categoria: string;
  presupuesto_maximo: number;
}

export interface BudgetStatus extends Budget {
  gastado: number;
  restante: number;
  porcentaje: number;
  excedido: boolean;
}

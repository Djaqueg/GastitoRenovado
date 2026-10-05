import type {
  Budget,
  BudgetStatus,
  GasResponse,
  Movement,
  MovementInput,
  Summary,
} from "./types";
import type { MonthPeriodMode } from "./month-period";
import { isAbortError, parseGasJsonText } from "./gas-upstream";

async function parseGasResponse<T>(response: Response): Promise<GasResponse<T>> {
  const text = await response.text();
  const json = parseGasJsonText(text, response.headers.get("content-type")) as GasResponse<T>;

  if (!json.success) {
    throw new Error(
      json.error ?? "Error desconocido al conectar con Google Sheets"
    );
  }

  return json;
}

function connectionError(error: unknown, fallback: string): Error {
  if (isAbortError(error)) return error as Error;
  return new Error(fallback);
}

/** All GAS calls go through Next.js to avoid CORS restrictions in the browser. */
async function gasRequest<T>(
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<GasResponse<T>> {
  let response: Response;

  try {
    const query = new URLSearchParams(params);
    response = await fetch(`/api/gas?${query}`, { signal });
  } catch (error) {
    throw connectionError(
      error,
      "No se pudo conectar con Google Sheets. Verifica que la aplicación esté en ejecución."
    );
  }

  return parseGasResponse<T>(response);
}

async function gasMutate<T>(body: object): Promise<GasResponse<T>> {
  let response: Response;

  try {
    response = await fetch("/api/gas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw connectionError(
      error,
      "No se pudo guardar el movimiento. Verifica que la aplicación esté en ejecución."
    );
  }

  return parseGasResponse<T>(response);
}

export async function fetchSummary(
  month: number,
  year: number,
  periodMode: MonthPeriodMode = "calendar",
  signal?: AbortSignal
): Promise<Summary> {
  const result = await gasRequest<Summary>(
    {
      action: "summary",
      month: String(month),
      year: String(year),
      period_mode: periodMode,
    },
    signal
  );
  return result.data ?? { ingresos: 0, gastos: 0, balance: 0 };
}

export async function fetchMovements(
  limit = 15,
  month?: number,
  year?: number,
  periodMode: MonthPeriodMode = "calendar",
  signal?: AbortSignal
): Promise<Movement[]> {
  const params: Record<string, string> = {
    action: "list",
    limit: String(limit),
    period_mode: periodMode,
  };
  if (month !== undefined) params.month = String(month);
  if (year !== undefined) params.year = String(year);

  const result = await gasRequest<Movement[]>(params, signal);
  return result.data ?? [];
}

export async function fetchMovement(id: string): Promise<Movement | null> {
  const result = await gasRequest<Movement>({ action: "get", id });
  return result.data ?? null;
}

function newClientRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function createMovement(input: MovementInput): Promise<Movement> {
  const result = await gasMutate<Movement>({
    action: "create",
    client_request_id: newClientRequestId(),
    ...input,
  });
  if (!result.data) throw new Error("No se recibió el movimiento creado");
  return result.data;
}

export async function updateMovement(
  id: string,
  input: MovementInput
): Promise<Movement> {
  const result = await gasMutate<Movement>({ action: "update", id, ...input });
  if (!result.data) throw new Error("No se recibió el movimiento actualizado");
  return result.data;
}

export async function deleteMovement(id: string): Promise<void> {
  await gasMutate<null>({ action: "delete", id });
}

export async function fetchBudgets(signal?: AbortSignal): Promise<Budget[]> {
  const result = await gasRequest<Budget[]>({ action: "budget_list" }, signal);
  return result.data ?? [];
}

export async function fetchBudgetStatus(
  month: number,
  year: number,
  periodMode: MonthPeriodMode = "calendar",
  signal?: AbortSignal
): Promise<BudgetStatus[]> {
  const result = await gasRequest<BudgetStatus[]>(
    {
      action: "budget_status",
      month: String(month),
      year: String(year),
      period_mode: periodMode,
    },
    signal
  );
  return result.data ?? [];
}

export async function saveBudget(
  categoria: string,
  presupuesto_maximo: number
): Promise<Budget> {
  const result = await gasMutate<Budget>({
    action: "budget_upsert",
    categoria,
    presupuesto_maximo,
  });
  if (!result.data) throw new Error("No se recibió el presupuesto guardado");
  return result.data;
}

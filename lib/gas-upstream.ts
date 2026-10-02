export const INVALID_GAS_RESPONSE_ERROR =
  "Google Sheets no respondió correctamente. Espera un momento e intenta de nuevo.";

export function isHtmlPayload(text: string, contentType?: string | null): boolean {
  const trimmed = text.trim();
  const type = contentType ?? "";
  return (
    type.includes("text/html") ||
    trimmed.startsWith("<") ||
    trimmed.toLowerCase().startsWith("<!doctype")
  );
}

export function parseGasJsonText(text: string, contentType?: string | null): unknown {
  const trimmed = text.trim();

  if (!trimmed || isHtmlPayload(trimmed, contentType)) {
    throw new Error(INVALID_GAS_RESPONSE_ERROR);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(INVALID_GAS_RESPONSE_ERROR);
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function fetchGas(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    redirect: "manual",
    cache: "no-store",
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error(INVALID_GAS_RESPONSE_ERROR);
    }

    const redirected = new URL(location, url);
    return fetch(redirected, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });
  }

  return response;
}

export async function readGasJson(response: Response): Promise<unknown> {
  const text = await response.text();
  return parseGasJsonText(text, response.headers.get("content-type"));
}

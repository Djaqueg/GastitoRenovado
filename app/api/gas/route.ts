import { NextRequest, NextResponse } from "next/server";
import {
  fetchGas,
  INVALID_GAS_RESPONSE_ERROR,
  readGasJson,
} from "@/lib/gas-upstream";

function getGasUrl(): string | null {
  return process.env.GAS_API_URL ?? process.env.NEXT_PUBLIC_GAS_API_URL ?? null;
}

function missingUrlResponse() {
  return NextResponse.json(
    { success: false, error: "GAS API URL no configurada en el servidor" },
    { status: 500 }
  );
}

function upstreamErrorResponse(err: unknown) {
  const message =
    err instanceof Error ? err.message : "Error al conectar con Google Sheets";
  const isInvalidPayload = message === INVALID_GAS_RESPONSE_ERROR;

  return NextResponse.json(
    { success: false, error: message },
    { status: isInvalidPayload ? 502 : 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const gasUrl = getGasUrl();
    if (!gasUrl) return missingUrlResponse();

    const query = request.nextUrl.searchParams.toString();
    const response = await fetchGas(`${gasUrl}?${query}`);
    const json = await readGasJson(response);
    return NextResponse.json(json);
  } catch (err) {
    return upstreamErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const gasUrl = getGasUrl();
    if (!gasUrl) return missingUrlResponse();

    const body = await request.json();
    const response = await fetchGas(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await readGasJson(response);
    return NextResponse.json(json);
  } catch (err) {
    return upstreamErrorResponse(err);
  }
}

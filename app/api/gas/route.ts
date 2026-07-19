import { NextRequest, NextResponse } from "next/server";

function getGasUrl(): string | null {
  return process.env.GAS_API_URL ?? process.env.NEXT_PUBLIC_GAS_API_URL ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const gasUrl = getGasUrl();

    if (!gasUrl) {
      return NextResponse.json(
        { success: false, error: "GAS API URL no configurada en el servidor" },
        { status: 500 }
      );
    }

    const query = request.nextUrl.searchParams.toString();
    const response = await fetch(`${gasUrl}?${query}`);
    const json = await response.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error al conectar con Google Sheets",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const gasUrl = getGasUrl();

    if (!gasUrl) {
      return NextResponse.json(
        { success: false, error: "GAS API URL no configurada en el servidor" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error al conectar con Google Sheets",
      },
      { status: 500 }
    );
  }
}

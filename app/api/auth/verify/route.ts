import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pin = String(body.pin ?? "");

    const authPin = process.env.AUTH_PIN;

    if (!authPin) {
      return NextResponse.json(
        { success: false, error: "PIN no configurado en el servidor" },
        { status: 500 }
      );
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { success: false, error: "El PIN debe tener exactamente 4 dígitos" },
        { status: 400 }
      );
    }

    if (pin === authPin) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "PIN incorrecto" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Solicitud inválida" },
      { status: 400 }
    );
  }
}

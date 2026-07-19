"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "./ui/Button";

const AUTH_KEY = "gastito_auth";

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored === "ok") setAuthenticated(true);
    setChecked(true);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem(AUTH_KEY, "ok");
        setAuthenticated(true);
      } else {
        setError(data.error ?? "PIN incorrecto");
        setPin("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-sm">
          <div className="card text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-mint">
              <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              Acceso a Finanzas del Hogar
            </h1>
            <p className="mb-8 text-sm text-gray-500">
              Ingresa tu PIN de 4 dígitos para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="input-field text-center text-2xl tracking-[0.5em]"
                autoFocus
                required
              />

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading || pin.length !== 4}>
                {loading ? "Verificando..." : "Ingresar"}
              </Button>
            </form>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">GAStito — Finanzas del Hogar</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

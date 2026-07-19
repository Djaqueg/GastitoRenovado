"use client";

import { useEffect, useState } from "react";
import {
  getCurrentPeriodMonthYear,
  getStoredMonthPeriodMode,
  setStoredMonthPeriodMode,
  type MonthPeriodMode,
} from "./month-period";

export function useMonthPeriodMode() {
  const [mode, setModeState] = useState<MonthPeriodMode>("calendar");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setModeState(getStoredMonthPeriodMode());
    setIsReady(true);
  }, []);

  function setMode(nextMode: MonthPeriodMode) {
    setModeState(nextMode);
    setStoredMonthPeriodMode(nextMode);
  }

  return { mode, setMode, isReady };
}

export function useCurrentPeriodSelection(mode: MonthPeriodMode, isReady: boolean) {
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!isReady) return;

    const current = getCurrentPeriodMonthYear(mode);
    setMonth(current.month);
    setYear(current.year);
  }, [isReady, mode]);

  return { month, year, setMonth, setYear };
}

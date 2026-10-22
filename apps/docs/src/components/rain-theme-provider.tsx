"use client";

import type {ReactNode} from "react";

import {usePathname} from "next/navigation";
import {createContext, useContext, useLayoutEffect, useMemo, useSyncExternalStore} from "react";

import {
  activateRainTheme,
  getRainThemeSnapshot,
  setRainThemeSelection,
  subscribeRainTheme,
  usesIndependentTheme,
} from "@/utils/rain-theme";

const RainThemeContext = createContext<{
  isRainTheme: boolean;
  setRainTheme: (enabled: boolean) => void;
} | null>(null);
const getServerSnapshot = () => false;

export function RainThemeProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const selected = useSyncExternalStore(
    subscribeRainTheme,
    getRainThemeSnapshot,
    getServerSnapshot,
  );
  const isRainTheme = selected && !usesIndependentTheme(pathname);

  useLayoutEffect(() => {
    if (isRainTheme) return activateRainTheme();
  }, [isRainTheme]);

  const value = useMemo(() => ({isRainTheme, setRainTheme: setRainThemeSelection}), [isRainTheme]);

  return <RainThemeContext value={value}>{children}</RainThemeContext>;
}

export function useRainTheme() {
  const value = useContext(RainThemeContext);

  if (!value) throw new Error("useRainTheme must be used within RainThemeProvider");

  return value;
}

"use client";

import type {Dictionary} from "@/lib/dictionaries";
import type {ReactNode} from "react";

import {Toast} from "@heroui/react";
import {i18nProvider} from "fumadocs-ui/i18n";
import {RootProvider} from "fumadocs-ui/provider/next";
import dynamic from "next/dynamic";

import {WebMCPProvider} from "@/components/ai/webmcp-provider";
import {LocaleLink} from "@/components/locale-link";
import {RainThemeProvider, useRainTheme} from "@/components/rain-theme-provider";
import {DictionaryProvider} from "@/hooks/use-dictionary";
import {translations} from "@/lib/layout.shared";

const SearchDialog = dynamic(() => import("@/components/search-dialog"), {
  ssr: false,
});

interface CustomRootProviderProps {
  children: ReactNode;
  dict: Dictionary;
  lang: string;
}

function ThemeAwareRootProvider({children, lang}: Omit<CustomRootProviderProps, "dict">) {
  const {isRainTheme} = useRainTheme();

  return (
    <RootProvider
      components={{Link: LocaleLink}}
      i18n={i18nProvider(translations, lang)}
      search={{SearchDialog}}
      theme={{forcedTheme: isRainTheme ? "light" : undefined}}
    >
      {children}
      {/* Global toast provider for demos using the default toast() function */}
      <Toast.Provider />
      <WebMCPProvider />
    </RootProvider>
  );
}

export function CustomRootProvider({children, dict, lang}: CustomRootProviderProps) {
  return (
    <DictionaryProvider dict={dict}>
      <RainThemeProvider>
        <ThemeAwareRootProvider lang={lang}>{children}</ThemeAwareRootProvider>
      </RainThemeProvider>
    </DictionaryProvider>
  );
}

import type {ThemeKey} from "../addons/theme/constants";
import type {Preview} from "@storybook/react";

import {DocsContainer as StorybookDocsContainer} from "@storybook/addon-docs/blocks";
import React, {useEffect, useMemo, useState} from "react";
import {addons} from "storybook/preview-api";

import {THEME_EVENT_NAME, THEME_GLOBAL_TYPE_ID, ensureThemeKey} from "../addons/theme/constants";
import {applyPreviewTheme, getBaseTheme} from "../addons/theme/preview-theme";
import {themes} from "../styles/theme";

/**
 * Custom DocsContainer that synchronizes the documentation theme
 * with the global theme state selected in the toolbar.
 */
export const DocsContainer: NonNullable<Preview["parameters"]>["docs"]["container"] = ({
  children,
  context,
}) => {
  const initialTheme = useMemo(
    () =>
      ensureThemeKey((context?.globals?.[THEME_GLOBAL_TYPE_ID] as string | undefined) || undefined),
    [context?.globals],
  );

  const [themeKey, setThemeKey] = useState<ThemeKey>(initialTheme);

  // MDX-only docs pages also need a themed root, even when no story decorator runs.
  useEffect(() => {
    applyPreviewTheme(document.documentElement, themeKey);
  }, [themeKey]);

  // Sync state when globals change (e.g. via toolbar)
  useEffect(() => {
    const next = ensureThemeKey(
      (context?.globals?.[THEME_GLOBAL_TYPE_ID] as string | undefined) || undefined,
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Guarded update to prevent unnecessary renders
    setThemeKey((prev) => (prev === next ? prev : next));
  }, [context?.globals]);

  // Sync state when custom theme event fires (ensures immediate update)
  useEffect(() => {
    const channel = addons.getChannel();
    const handleThemeChange = (event: {theme: string}) => {
      const next = ensureThemeKey(event.theme);

      setThemeKey((prev) => (prev === next ? prev : next));
    };

    channel.on(THEME_EVENT_NAME, handleThemeChange);

    return () => {
      channel.off(THEME_EVENT_NAME, handleThemeChange);
    };
  }, []);

  const selectedTheme = themes[getBaseTheme(themeKey)];

  return (
    <StorybookDocsContainer context={context} theme={selectedTheme}>
      {children}
    </StorybookDocsContainer>
  );
};

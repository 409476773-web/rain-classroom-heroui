export const THEME_ADDON_ID = "heroui-theme-addon";
export const THEME_GLOBAL_TYPE_ID = "heroui-theme";
export const THEME_PARAM_KEY = "heroui-theme";
export const THEME_EVENT_NAME = "heroui-theme-changed";

export const THEME_VALUES = ["light", "dark", "rain-light"] as const;
export type ThemeKey = (typeof THEME_VALUES)[number];

export const DEFAULT_THEME: ThemeKey = THEME_VALUES[0];

export interface ThemeOption {
  value: ThemeKey;
  title: string;
  description?: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    value: THEME_VALUES[0],
    title: "HeroUI Light",
    description: "Original HeroUI light theme",
  },
  {
    value: THEME_VALUES[1],
    title: "HeroUI Dark",
    description: "Original HeroUI dark theme",
  },
  {
    value: "rain-light",
    title: "雨课堂 Light",
    description: "Rain Classroom light theme",
  },
];

export const isThemeKey = (value: string | undefined | null): value is ThemeKey =>
  !!value && THEME_VALUES.includes(value as ThemeKey);

export const ensureThemeKey = (value: string | undefined | null): ThemeKey =>
  isThemeKey(value) ? value : DEFAULT_THEME;

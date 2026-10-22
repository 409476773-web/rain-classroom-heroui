import {THEME_VALUES, ensureThemeKey} from "./constants";

export interface PreviewThemeRoot {
  classList: Pick<DOMTokenList, "add" | "remove">;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function getBaseTheme(theme: string): "light" | "dark" {
  return theme === "dark" ? "dark" : "light";
}

/** Scope tokens to the preview document so body portals inherit the same theme. */
export function applyPreviewTheme(root: PreviewThemeRoot, value: string): void {
  const theme = ensureThemeKey(value);
  const mode = getBaseTheme(theme);

  root.classList.remove(...THEME_VALUES, "default");
  root.classList.add(mode);
  root.setAttribute("data-theme", mode);

  if (theme === "rain-light") {
    root.setAttribute("data-rain-theme", "light");
  } else {
    root.removeAttribute("data-rain-theme");
  }
}

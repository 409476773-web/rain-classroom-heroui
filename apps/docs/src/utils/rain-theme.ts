export const RAIN_THEME_STORAGE_KEY = "rain-classroom-docs-theme";
const CHANGE_EVENT = "rain-classroom-docs-theme-change";
let sessionSelection = false;
let storageWriteFailed = false;

export function getRainThemeSnapshot() {
  if (typeof window === "undefined") return false;
  if (storageWriteFailed) return sessionSelection;

  try {
    return window.localStorage.getItem(RAIN_THEME_STORAGE_KEY) === "rain";
  } catch {
    return sessionSelection;
  }
}

export function setRainThemeSelection(enabled: boolean) {
  sessionSelection = enabled;

  try {
    window.localStorage.setItem(RAIN_THEME_STORAGE_KEY, enabled ? "rain" : "heroui");
    storageWriteFailed = false;
  } catch {
    // The current session remains usable when browser storage is unavailable.
    storageWriteFailed = true;
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeRainTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === RAIN_THEME_STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function usesIndependentTheme(pathname: string | null) {
  return /^\/(?:cn\/|en\/)?(?:themes(?:\/|$)|showcase\/[^/]+(?:\/|$))/.test(pathname ?? "");
}

const appearanceProperties = new Set([
  "font-family",
  "--font-sans",
  "--font-mono",
  "--radius",
  "--field-radius",
  "--field-background",
  "--field-foreground",
  "--field-placeholder",
  "--field-border",
  "--field-hover",
  "--field-focus",
  "--field-border-hover",
  "--field-border-focus",
]);
const colorProperty =
  /^--(?:accent|background|foreground|surface|overlay|focus|default|muted|separator|border|success|warning|danger|segment|link|backdrop)(?:-(?:foreground|hover|soft|soft-foreground|soft-hover|secondary|secondary-foreground|tertiary|tertiary-foreground|inverse))?$/;
const radiusProperty = /^--radius-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)$/;

/** Suspend appearance overrides only; layout, motion and official saved preferences stay intact. */
export function activateRainTheme() {
  const root = document.documentElement;
  const attributes = ["data-design-theme", "data-vibrant-palette", "data-theme"].map(
    (name) => [name, root.getAttribute(name)] as const,
  );
  const styles = Array.from(root.style)
    .filter(
      (name) =>
        appearanceProperties.has(name) ||
        colorProperty.test(name) ||
        radiusProperty.test(name) ||
        name.startsWith("--color-"),
    )
    .map((name) => ({
      name,
      priority: root.style.getPropertyPriority(name),
      value: root.style.getPropertyValue(name),
    }));
  const injectedStyles = Array.from(
    document.querySelectorAll(
      '#design-theme-css-link, #theme-builder-adaptive-colors, #theme-builder-theme-colors, #theme-builder-font-var, link[id^="font-link-"]',
    ),
  ).map((element) => ({element, media: element.getAttribute("media")}));

  root.removeAttribute("data-design-theme");
  root.removeAttribute("data-vibrant-palette");
  root.setAttribute("data-theme", "light");
  styles.forEach(({name}) => root.style.removeProperty(name));
  injectedStyles.forEach(({element}) => element.setAttribute("media", "not all"));
  root.setAttribute("data-rain-theme", "light");

  return () => {
    root.removeAttribute("data-rain-theme");
    attributes.forEach(([name, value]) => {
      if (value === null) root.removeAttribute(name);
      else root.setAttribute(name, value);
    });
    styles.forEach(({name, priority, value}) => root.style.setProperty(name, value, priority));
    injectedStyles.forEach(({element, media}) => {
      if (media === null) element.removeAttribute("media");
      else element.setAttribute("media", media);
    });
  };
}

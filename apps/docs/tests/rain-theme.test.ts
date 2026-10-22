// @vitest-environment jsdom

import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {
  RAIN_THEME_STORAGE_KEY,
  activateRainTheme,
  getRainThemeSnapshot,
  setRainThemeSelection,
  subscribeRainTheme,
  usesIndependentTheme,
} from "@/utils/rain-theme";

describe("Rain Classroom docs theme", () => {
  beforeEach(() => {
    localStorage.clear();
    setRainThemeSelection(false);
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-rain-theme");
    document.documentElement.removeAttribute("data-design-theme");
    document.documentElement.removeAttribute("data-vibrant-palette");
    document.documentElement.removeAttribute("data-theme");
    document.head.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("temporarily isolates root theme overrides and restores them without changing layout", () => {
    const root = document.documentElement;

    root.setAttribute("data-design-theme", "lavender");
    root.setAttribute("data-vibrant-palette", "true");
    root.setAttribute("data-theme", "dark");
    root.style.setProperty("--accent", "red", "important");
    root.style.setProperty("--font-sans", '"Custom font"');
    root.style.setProperty("--radius", "1rem");
    root.style.setProperty("--field-radius", "0.75rem");
    root.style.setProperty("--spacing", "0.25rem");
    root.style.setProperty("--field-border-width", "2px");
    root.style.setProperty("--surface-shadow", "0 1px 4px black");
    root.style.width = "1200px";

    const customFont = document.createElement("style");

    customFont.id = "theme-builder-font-var";
    customFont.textContent = ':root { --font-sans: "Custom font"; }';
    document.head.append(customFont);

    const restore = activateRainTheme();

    expect(root.getAttribute("data-rain-theme")).toBe("light");
    expect(root.hasAttribute("data-design-theme")).toBe(false);
    expect(root.hasAttribute("data-vibrant-palette")).toBe(false);
    expect(root.getAttribute("data-theme")).toBe("light");
    expect(root.style.getPropertyValue("--accent")).toBe("");
    expect(root.style.getPropertyValue("--font-sans")).toBe("");
    expect(root.style.getPropertyValue("--radius")).toBe("");
    expect(root.style.getPropertyValue("--field-radius")).toBe("");
    expect(customFont.media).toBe("not all");
    expect(root.style.getPropertyValue("--spacing")).toBe("0.25rem");
    expect(root.style.getPropertyValue("--field-border-width")).toBe("2px");
    expect(root.style.getPropertyValue("--surface-shadow")).toBe("0 1px 4px black");
    expect(root.style.width).toBe("1200px");

    restore();

    expect(root.hasAttribute("data-rain-theme")).toBe(false);
    expect(root.getAttribute("data-design-theme")).toBe("lavender");
    expect(root.getAttribute("data-vibrant-palette")).toBe("true");
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(root.style.getPropertyValue("--accent")).toBe("red");
    expect(root.style.getPropertyPriority("--accent")).toBe("important");
    expect(root.style.getPropertyValue("--font-sans")).toBe('"Custom font"');
    expect(root.style.getPropertyValue("--radius")).toBe("1rem");
    expect(customFont.hasAttribute("media")).toBe(false);
  });

  it("persists the library choice separately from the original preset and color mode", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("heroui-docs-design-theme", "lavender");
    const listener = vi.fn();
    const unsubscribe = subscribeRainTheme(listener);

    setRainThemeSelection(true);

    expect(getRainThemeSnapshot()).toBe(true);
    expect(localStorage.getItem(RAIN_THEME_STORAGE_KEY)).toBe("rain");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("heroui-docs-design-theme")).toBe("lavender");
    expect(listener).toHaveBeenCalledOnce();

    unsubscribe();
    setRainThemeSelection(false);

    expect(getRainThemeSnapshot()).toBe(false);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("restores a saved Rain selection and rejects unknown stored values", () => {
    localStorage.setItem(RAIN_THEME_STORAGE_KEY, "rain");
    expect(getRainThemeSnapshot()).toBe(true);
    localStorage.setItem(RAIN_THEME_STORAGE_KEY, "unknown");
    expect(getRainThemeSnapshot()).toBe(false);
  });

  it("keeps switching available for the current session when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });

    expect(() => setRainThemeSelection(true)).not.toThrow();
    expect(getRainThemeSnapshot()).toBe(true);
    setRainThemeSelection(false);
    expect(getRainThemeSnapshot()).toBe(false);
  });

  it("uses the session choice when readable storage rejects writes", () => {
    localStorage.setItem(RAIN_THEME_STORAGE_KEY, "heroui");
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage full", "QuotaExceededError");
    });

    setRainThemeSelection(true);

    expect(localStorage.getItem(RAIN_THEME_STORAGE_KEY)).toBe("heroui");
    expect(getRainThemeSnapshot()).toBe(true);
    setRainThemeSelection(false);
    expect(getRainThemeSnapshot()).toBe(false);

    setItem.mockRestore();
    setRainThemeSelection(true);
    expect(localStorage.getItem(RAIN_THEME_STORAGE_KEY)).toBe("rain");
  });

  it.each(["/themes", "/cn/themes", "/en/themes", "/cn/themes/preview"])(
    "keeps the official theme builder independent at %s",
    (pathname) => {
      expect(usesIndependentTheme(pathname)).toBe(true);
    },
  );

  it("does not treat component docs as the theme builder", () => {
    expect(usesIndependentTheme("/docs/react/getting-started/theming")).toBe(false);
    expect(usesIndependentTheme("/cn/docs/react/components/button")).toBe(false);
  });

  it.each(["/showcase/acme", "/cn/showcase/acme", "/en/showcase/acme"])(
    "keeps the independent brand showcase unthemed at %s",
    (pathname) => {
      expect(usesIndependentTheme(pathname)).toBe(true);
    },
  );
});

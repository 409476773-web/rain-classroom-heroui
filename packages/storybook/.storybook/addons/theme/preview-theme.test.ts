import {describe, expect, it} from "vitest";

import {THEME_OPTIONS, ensureThemeKey} from "./constants";
import {applyPreviewTheme, getBaseTheme} from "./preview-theme";

function createRoot() {
  const attributes = new Map<string, string>();
  const classes = new Set<string>(["existing-document-class", "dark"]);
  const root = {
    classList: {
      add: (...tokens: string[]) => tokens.forEach((token) => classes.add(token)),
      remove: (...tokens: string[]) => tokens.forEach((token) => classes.delete(token)),
    },
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  };

  return {attributes, classes, root};
}

describe("Storybook rain theme switching", () => {
  it("offers the rain option and preserves it when normalizing globals", () => {
    expect(THEME_OPTIONS.map((option) => option.value)).toEqual(["light", "dark", "rain-light"]);
    expect(ensureThemeKey("rain-light")).toBe("rain-light");
  });

  it("uses light chrome for rain and dark chrome only for the original dark mode", () => {
    expect(getBaseTheme("rain-light")).toBe("light");
    expect(getBaseTheme("light")).toBe("light");
    expect(getBaseTheme("dark")).toBe("dark");
    expect(getBaseTheme("unknown")).toBe("light");
  });

  it("applies the rain scope on the document root that also owns body portals", () => {
    const {attributes, classes, root} = createRoot();

    applyPreviewTheme(root, "rain-light");

    expect(attributes.get("data-theme")).toBe("light");
    expect(attributes.get("data-rain-theme")).toBe("light");
    expect(classes.has("light")).toBe(true);
    expect(classes.has("dark")).toBe(false);
    expect(classes.has("rain-light")).toBe(false);
    expect(classes.has("existing-document-class")).toBe(true);
  });

  it.each(["light", "dark", "unknown"])("removes rain scope when returning to %s", (theme) => {
    const {attributes, classes, root} = createRoot();

    applyPreviewTheme(root, "rain-light");
    applyPreviewTheme(root, theme);

    const base = theme === "dark" ? "dark" : "light";

    expect(attributes.has("data-rain-theme")).toBe(false);
    expect(attributes.get("data-theme")).toBe(base);
    expect(classes.has(base)).toBe(true);
    expect(classes.has(base === "light" ? "dark" : "light")).toBe(false);
    expect(classes.has("existing-document-class")).toBe(true);
  });
});

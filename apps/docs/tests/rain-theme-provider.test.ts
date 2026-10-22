// @vitest-environment jsdom

import {ThemeProvider} from "next-themes";
import {act, createElement} from "react";
import {createRoot, hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {RainThemeProvider, useRainTheme} from "@/components/rain-theme-provider";
import {setRainThemeSelection} from "@/utils/rain-theme";

const navigation = vi.hoisted(() => ({pathname: "/docs/react/components/button"}));

vi.mock("next/navigation", () => ({usePathname: () => navigation.pathname}));

function ThemeContent() {
  const {isRainTheme} = useRainTheme();

  return createElement(
    ThemeProvider,
    {attribute: "class", forcedTheme: isRainTheme ? "light" : undefined},
    createElement("span", null, isRainTheme ? "Rain Classroom" : "HeroUI Original"),
  );
}

function App() {
  return createElement(RainThemeProvider, null, createElement(ThemeContent));
}

describe("Rain theme provider", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | undefined;

  beforeEach(() => {
    localStorage.clear();
    setRainThemeSelection(false);
    localStorage.setItem("theme", "dark");
    document.documentElement.className = "";
    navigation.pathname = "/docs/react/components/button";
    container = document.createElement("div");
    document.body.append(container);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("matchMedia", () => ({
      addListener: vi.fn(),
      matches: false,
      removeListener: vi.fn(),
    }));
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    container.remove();
    vi.unstubAllGlobals();
  });

  it("forces light without replacing the saved dark preference, then restores dark", async () => {
    root = createRoot(container);
    await act(async () => root?.render(createElement(App)));
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await act(async () => setRainThemeSelection(true));

    expect(document.documentElement.getAttribute("data-rain-theme")).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    await act(async () => setRainThemeSelection(false));

    expect(document.documentElement.hasAttribute("data-rain-theme")).toBe(false);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it.each(["/cn/themes", "/cn/showcase/acme"])(
    "suspends Rain at %s and resumes it on component docs",
    async (pathname) => {
      setRainThemeSelection(true);
      root = createRoot(container);
      await act(async () => root?.render(createElement(App)));
      expect(document.documentElement.getAttribute("data-rain-theme")).toBe("light");

      navigation.pathname = pathname;
      await act(async () => root?.render(createElement(App)));
      expect(document.documentElement.hasAttribute("data-rain-theme")).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(true);

      navigation.pathname = "/cn/docs/react/components/button";
      await act(async () => root?.render(createElement(App)));
      expect(document.documentElement.getAttribute("data-rain-theme")).toBe("light");
    },
  );

  it("hydrates a saved Rain preference without a server/client content mismatch", async () => {
    setRainThemeSelection(true);
    container.innerHTML = renderToString(createElement(App));
    const onRecoverableError = vi.fn();

    expect(container.textContent).toContain("HeroUI Original");
    await act(async () => {
      root = hydrateRoot(container, createElement(App), {onRecoverableError});
    });

    expect(container.textContent).toContain("Rain Classroom");
    expect(document.documentElement.getAttribute("data-rain-theme")).toBe("light");
    expect(onRecoverableError).not.toHaveBeenCalled();
  });
});

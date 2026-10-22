// @vitest-environment jsdom

import type catalog from "@/generated/rain-catalog.json";

import {act, createElement} from "react";
import {createRoot, hydrateRoot} from "react-dom/client";
import {renderToString} from "react-dom/server";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {RainCenter} from "@/components/rain-center/rain-center";

const theme = vi.hoisted(() => ({isRainTheme: true, resolvedTheme: "light" as string | undefined}));

vi.mock("~env", () => ({env: {NEXT_PUBLIC_RAIN_STORYBOOK_URL: "http://127.0.0.1:6006"}}));
vi.mock("next-themes", () => ({useTheme: () => ({resolvedTheme: theme.resolvedTheme})}));
vi.mock("@/components/rain-theme-provider", () => ({
  useRainTheme: () => ({isRainTheme: theme.isRainTheme, setRainTheme: vi.fn()}),
}));
vi.mock("@/generated/rain-catalog.json", async (original) => {
  const source = await original<{default: typeof catalog}>();

  return {
    ...source,
    default: {...source.default, entries: source.default.entries.filter(({id}) => id === "card")},
  };
});

describe("Rain center copy flow", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const writeText = vi.fn<(text: string) => Promise<void>>();
  const button = (text: string) => {
    const element = [...container.querySelectorAll("button")].find(
      (item) => item.textContent?.trim() === text,
    );

    expect(element, `button ${text}`).toBeDefined();

    return element!;
  };
  const click = async (text: string) => act(async () => button(text).click());
  const open = async (locale: "cn" | "en") => {
    await act(async () => root.render(createElement(RainCenter, {locale})));
    await click(locale === "cn" ? "源码与 AI 上下文" : "Source and AI context");
  };

  beforeEach(() => {
    theme.isRainTheme = true;
    theme.resolvedTheme = "light";
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    writeText.mockReset().mockResolvedValue();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText}});
    vi.stubGlobal("matchMedia", () => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      matches: false,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  });
  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("hydrates preview links before applying a saved dark theme", async () => {
    await act(async () => root.unmount());
    theme.isRainTheme = false;
    theme.resolvedTheme = undefined;
    container.innerHTML = renderToString(createElement(RainCenter));
    const preview = () => container.querySelector<HTMLAnchorElement>('a[target="_blank"]')!;

    expect(new URL(preview().href).searchParams.get("globals")).toBe("heroui-theme:light");
    theme.resolvedTheme = "dark";
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const onRecoverableError = vi.fn();

    await act(async () => {
      root = hydrateRoot(container, createElement(RainCenter), {onRecoverableError});
    });

    expect(
      consoleError.mock.calls.filter((args) => /hydration|hydrated/i.test(args.join(" "))),
    ).toEqual([]);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(new URL(preview().href).searchParams.get("globals")).toBe("heroui-theme:dark");
  });

  it("copies the English sources shown by the English center", async () => {
    await open("en");
    await click("Copy AI context");
    const text = writeText.mock.calls[0]![0];

    expect(text).toContain("apps/docs/content/docs/en/react/components/");
    expect(text).toContain("apps/docs/src/demos/en/card/default.tsx");
    expect(text).not.toContain("apps/docs/src/demos/cn/");
    expect(text).toContain("Project root:");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("Copied");
  });

  it("removes the old success label and exposes full text after clipboard rejection", async () => {
    await open("cn");
    await click("复制 AI 上下文");
    expect(button("已复制")).toBeDefined();
    writeText.mockRejectedValueOnce(new Error("Clipboard denied"));
    await click("已复制");

    expect(container.querySelector('[role="status"]')?.textContent).toContain("复制未完成");
    expect(
      [...container.querySelectorAll("button")].some(
        (item) => item.textContent?.trim() === "已复制",
      ),
    ).toBe(false);
    expect(button("复制 AI 上下文")).toBeDefined();
    const fallback = container.querySelector("textarea");

    expect(fallback?.readOnly).toBe(true);
    expect(fallback?.value).toContain("项目根目录：");
    expect(fallback?.value).toContain("HeroUI 3.2.6");
    expect(fallback?.value).toContain("apps/docs/src/demos/cn/card/default.tsx");
  });

  it("clears the previous copy feedback when filters are reset", async () => {
    await open("cn");
    const input = container.querySelector("input")!;

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        "Card",
      );
      input.dispatchEvent(new Event("input", {bubbles: true}));
    });
    await click("复制 AI 上下文");
    await click("清除筛选");

    expect(input.value).toBe("");
    expect(container.querySelector('[role="status"]')?.textContent).toBe("");
    expect(button("复制 AI 上下文")).toBeDefined();
  });

  it.each(["resolve", "reject"])(
    "does not restore copy feedback when a cleared request later %ss",
    async (outcome) => {
      let settle!: () => void;

      writeText.mockImplementationOnce(
        () =>
          new Promise<void>((resolve, reject) => {
            settle = outcome === "resolve" ? resolve : () => reject(new Error("Clipboard denied"));
          }),
      );
      await open("cn");
      const input = container.querySelector("input")!;

      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
          input,
          "Card",
        );
        input.dispatchEvent(new Event("input", {bubbles: true}));
      });
      await click("复制 AI 上下文");
      await click("清除筛选");
      await act(async () => settle());

      expect(container.querySelector('[role="status"]')?.textContent).toBe("");
      expect(container.querySelector("textarea")).toBeNull();
      expect(button("复制 AI 上下文").disabled).toBe(false);
    },
  );
});

/* global document, requestAnimationFrame, getComputedStyle */
import assert from "node:assert/strict";
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";

const docsRequire = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const testingRequire = createRequire(
  new URL("../../packages/testing/package.json", import.meta.url),
);
const {chromium} = testingRequire("playwright");
const postcss = docsRequire("postcss");
const tailwind = docsRequire("@tailwindcss/postcss");
const evidence = new URL(
  "../../evidence/runtime/rain-theme-state-audit-2026-10-19/",
  import.meta.url,
);
const records = [];
const preserved = [
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "fontSize",
  "lineHeight",
  "fontWeight",
  "letterSpacing",
  "boxShadow",
  "borderWidth",
  "opacity",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "animationName",
  "animationDuration",
  "animationTimingFunction",
  "cursor",
  "pointerEvents",
  "zIndex",
  "outlineWidth",
  "outlineOffset",
  "outlineStyle",
  "backdropFilter",
];
const properties = [
  ...preserved,
  "backgroundColor",
  "color",
  "fontFamily",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "fill",
];
const containers = [
  ["modal", "modal__dialog", 16],
  ["alert-dialog", "alert-dialog__dialog", 16],
  ["popover", "popover", 16],
  ["dropdown", "dropdown__popover", 16],
  ["tooltip", "tooltip", 8],
  ["toast", "toast", 16],
];
const triggers = ["modal", "alert-dialog", "popover", "dropdown", "drawer", "tooltip"];
let browser;
let baselineCss;
let themeCss;

before(async () => {
  baselineCss = (
    await postcss([tailwind()]).process(
      '@import "tailwindcss"; @import "@heroui/styles"; :root { --font-sans: Inter, sans-serif; } body { font-family: var(--font-sans); color: var(--foreground); }',
      {
        from: fileURLToPath(
          new URL("../../packages/storybook/overlay-fixture.css", import.meta.url),
        ),
      },
    )
  ).css;
  themeCss = await readFile(
    new URL("../../packages/rain-theme/index.css", import.meta.url),
    "utf8",
  );
  browser = await chromium.launch({headless: true});
});

after(async () => {
  await browser?.close();
  await mkdir(evidence, {recursive: true});
  await writeFile(
    new URL("overlay-css-states.json", evidence),
    `${JSON.stringify(
      {
        records,
        scope:
          "Real compiled HeroUI CSS on state fixtures. Actual component portal/focus behavior is covered separately by the Rain browser suite.",
      },
      null,
      2,
    )}\n`,
  );
});

async function pageFor(markup, mode = "light") {
  const page = await browser.newPage();

  await page.setContent(`<html class="${mode}"><head></head><body>${markup}</body></html>`);
  await page.addStyleTag({content: baselineCss});
  await page.addStyleTag({content: themeCss});
  await page.mouse.move(1200, 700);

  return page;
}

async function setRain(page, enabled) {
  await page.evaluate((enabled) => {
    if (enabled) document.documentElement.dataset.rainTheme = "light";
    else delete document.documentElement.dataset.rainTheme;
  }, enabled);
}

async function snapshot(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });

  return page.evaluate(
    (properties) =>
      Object.fromEntries(
        [...document.querySelectorAll("[data-audit]")].map((element) => {
          const style = getComputedStyle(element);

          return [
            element.getAttribute("data-audit"),
            Object.fromEntries(properties.map((key) => [key, style[key]])),
          ];
        }),
      ),
    properties,
  );
}

function comparePreserved(original, rain, label) {
  for (const [id, styles] of Object.entries(original)) {
    for (const key of preserved) {
      // HeroUI draws focus rings in box-shadow. The ring colors are brand tokens;
      // preserve their dimensions and layers while allowing those colors to change.
      const comparable = (value) =>
        key === "boxShadow"
          ? value.replace(/(?:rgba?|oklch|oklab|color)\([^)]*\)/g, "COLOR")
          : value;

      assert.equal(comparable(rain[id][key]), comparable(styles[key]), `${label}: ${id}.${key}`);
    }
  }
}

test("overlay containers and four drawer placements change only allowed brand roles", async () => {
  const markup =
    containers
      .map(
        ([id, cls]) =>
          `<div data-audit="${id}" class="${cls}" data-frontmost="true">浮层正文</div>`,
      )
      .join("") +
    ["top", "bottom", "left", "right"]
      .map(
        (placement) =>
          `<div data-audit="drawer-${placement}" class="drawer__dialog" data-placement="${placement}">抽屉正文</div>`,
      )
      .join("");
  const page = await pageFor(markup);

  try {
    const original = await snapshot(page);

    await setRain(page, true);
    const rain = await snapshot(page);

    comparePreserved(original, rain, "containers");
    for (const [id, , radius] of containers) {
      assert.equal(rain[id].backgroundColor, "rgb(255, 255, 255)");
      assert.equal(rain[id].color, "rgb(20, 35, 60)");
      assert.match(rain[id].fontFamily, /PingFang SC/);
      assert.equal(rain[id].borderTopLeftRadius, `${radius}px`);
    }
    assert.equal(rain["drawer-bottom"].borderTopLeftRadius, "12px");
    assert.equal(rain["drawer-bottom"].borderBottomLeftRadius, "0px");
    assert.equal(rain["drawer-top"].borderBottomLeftRadius, "12px");
    assert.equal(rain["drawer-top"].borderTopLeftRadius, "0px");
    for (const side of ["left", "right"]) {
      for (const corner of ["TopLeft", "TopRight", "BottomLeft", "BottomRight"]) {
        assert.equal(rain[`drawer-${side}`][`border${corner}Radius`], "0px");
      }
    }
    await setRain(page, false);
    assert.deepEqual(await snapshot(page), original);
    records.push({case: "containers", original, rain, restoredExactly: true});
  } finally {
    await page.close();
  }
});

test("overlay triggers and close button retain default, hover, keyboard focus, pressed and disabled state behavior", async () => {
  for (const [id, cls] of [
    ...triggers.map((name) => [name, `${name}__trigger`]),
    ["close", "close-button close-button--default"],
  ]) {
    const page = await pageFor(`<button data-audit="control" class="${cls}">状态按钮</button>`);

    try {
      const button = page.getByRole("button", {name: "状态按钮"});

      for (const state of ["default", "hover", "focus", "pressed", "disabled"]) {
        await page.mouse.move(1200, 700);
        await button.evaluate((element) => {
          element.disabled = false;
          element.blur();
          element.removeAttribute("data-pressed");
        });
        if (state === "hover") await button.hover();
        if (state === "focus") await page.keyboard.press("Tab");
        if (state === "pressed")
          await button.evaluate((element) => element.setAttribute("data-pressed", "true"));
        if (state === "disabled")
          await button.evaluate((element) => {
            element.disabled = true;
          });
        await setRain(page, false);
        const original = await snapshot(page);

        await setRain(page, true);
        const rain = await snapshot(page);

        comparePreserved(original, rain, `${id}/${state}`);
        assert.equal(rain.control.borderTopLeftRadius, original.control.borderTopLeftRadius);
        if (state === "disabled" && id !== "tooltip") assert.equal(rain.control.opacity, "0.5");
        if (state === "focus") {
          assert.equal(
            await button.evaluate((element) => element === document.activeElement),
            true,
          );
          const ring = await button.evaluate((element) => getComputedStyle(element).boxShadow);

          assert.match(ring, /rgb\(61, 123, 255\).*4px/);
        }
        records.push({case: `${id}/${state}`, original, rain});
      }
    } finally {
      await page.close();
    }
  }
});

test("overlay arrows, status content and backdrop variants inherit the intended colors", async () => {
  const page = await pageFor(`
    <div class="popover"><svg data-audit="popover-arrow" data-slot="popover-overlay-arrow"></svg></div>
    <div class="dropdown__popover"><svg data-audit="dropdown-arrow" data-slot="popover-overlay-arrow"></svg></div>
    <div class="tooltip"><svg data-audit="tooltip-arrow" data-slot="overlay-arrow"></svg></div>
    ${["modal", "alert-dialog", "drawer"].flatMap((name) => ["transparent", "opaque", "blur"].map((variant) => `<div data-audit="${name}-${variant}" class="${name}__backdrop ${name}__backdrop--${variant}"></div>`)).join("")}
    ${["accent", "success", "warning", "danger"].map((status) => `<div class="toast toast--${status}" data-frontmost="true"><span data-audit="toast-${status}" class="toast__title">状态信息</span></div><div data-audit="alert-${status}" class="alert-dialog__icon alert-dialog__icon--${status}"></div>`).join("")}
  `);

  try {
    const original = await snapshot(page);

    await setRain(page, true);
    const rain = await snapshot(page);

    comparePreserved(original, rain, "details");
    for (const name of ["popover", "dropdown", "tooltip"])
      assert.equal(rain[`${name}-arrow`].fill, "rgb(255, 255, 255)");
    for (const name of ["modal", "alert-dialog", "drawer"]) {
      for (const variant of ["transparent", "opaque", "blur"])
        assert.equal(
          rain[`${name}-${variant}`].backgroundColor,
          original[`${name}-${variant}`].backgroundColor,
        );
    }
    // Resolve the semantic role in the browser: success/warning keep HeroUI's
    // foreground mix, so their soft text intentionally differs from the solid fill.
    const statusColors = await page.evaluate(() => {
      const probe = document.createElement("span");

      document.body.append(probe);
      const colors = Object.fromEntries(
        ["accent", "danger", "success", "warning"].map((status) => {
          probe.style.color = `var(--${status}-soft-foreground)`;

          return [status, getComputedStyle(probe).color];
        }),
      );

      probe.remove();

      return colors;
    });

    for (const [status, color] of Object.entries(statusColors)) {
      assert.equal(rain[`toast-${status}`].color, color);
      assert.equal(rain[`alert-${status}`].color, color);
    }
    assert.equal(statusColors.accent, "rgb(15, 85, 223)");
    assert.equal(statusColors.danger, "rgb(181, 42, 54)");
    assert.notEqual(statusColors.success, "rgb(24, 121, 78)");
    assert.notEqual(statusColors.warning, "rgb(165, 91, 0)");
    records.push({case: "arrows-backdrops-status", original, rain, statusColors});
  } finally {
    await page.close();
  }
});

test("overlay entering and exiting states preserve motion and pointer-event rules", async () => {
  const cases = [
    ...containers,
    ["modal-backdrop", "modal__backdrop"],
    ["alert-backdrop", "alert-dialog__backdrop"],
    ["drawer", "drawer__backdrop"],
  ];

  for (const state of ["entering", "exiting"]) {
    const page = await pageFor(
      cases
        .map(
          ([id, cls]) =>
            `<div data-audit="${id}" class="${cls}" data-${state}="true" data-frontmost="true">浮层</div>`,
        )
        .join(""),
    );

    try {
      const original = await snapshot(page);

      await setRain(page, true);
      const rain = await snapshot(page);

      comparePreserved(original, rain, state);
      if (state === "exiting") {
        for (const id of ["popover", "dropdown", "tooltip"])
          assert.equal(rain[id].pointerEvents, "none");
      }
      records.push({case: state, original, rain});
    } finally {
      await page.close();
    }
  }
});

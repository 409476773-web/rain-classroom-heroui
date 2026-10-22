/* global document, requestAnimationFrame, getComputedStyle */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createRequire} from "node:module";
import {after, before, test} from "node:test";
import {fileURLToPath} from "node:url";

const docsRequire = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const testingRequire = createRequire(
  new URL("../../packages/testing/package.json", import.meta.url),
);
const {chromium} = testingRequire("playwright");
const from = fileURLToPath(new URL("../../packages/storybook/theme-fixture.css", import.meta.url));
const fixtures = [];
const add = (id, html) => fixtures.push({html, id});

// These data-state fixtures exercise the pinned component CSS. React Aria keyboard,
// selection and portal behavior is covered separately by the upstream browser suites.
for (const variant of ["default", "secondary", "tertiary", "transparent"]) {
  add(
    `card-${variant}`,
    `<section class="card card--${variant}" data-probe><div class="card__title" data-probe>课程卡片</div><div class="card__description" data-probe>班级描述</div></section>`,
  );
}
for (const variant of ["primary", "secondary"]) {
  for (const state of [
    "default",
    "hovered",
    "selected",
    "disabled",
    "focus-visible",
    "drop-target",
  ]) {
    add(
      `table-${variant}-${state}`,
      `<div class="table-root table-root--${variant}"><table class="table__content"><tbody class="table__body"><tr class="table__row" data-${state}="true"><td class="table__cell" data-probe>学生作业</td><td class="table__cell">86 分</td></tr></tbody></table></div>`,
    );
  }
}
for (const block of ["list-box-item", "menu-item"]) {
  for (const variant of ["default", "danger"]) {
    for (const state of [
      "default",
      "hovered",
      "selected",
      "disabled",
      "focus-visible",
      "pressed",
    ]) {
      add(
        `${block}-${variant}-${state}`,
        `<div class="surface surface--default"><div class="${block} ${block}--${variant}" data-${state}="true" data-probe><span data-slot="label" data-probe>学生作业</span><span data-slot="description" class="description" data-probe>未批改</span></div></div>`,
      );
    }
  }
}
for (const variant of ["default", "surface"]) {
  for (const state of [
    "default",
    "hovered",
    "selected",
    "disabled",
    "focus-visible",
    "selected-hovered",
  ]) {
    add(
      `tag-${variant}-${state}`,
      `<div class="surface surface--default"><span class="tag tag--${variant}" data-${state === "selected-hovered" ? "selected" : state}="true" ${state === "selected-hovered" ? 'data-hovered="true"' : ""} data-probe>作业标签</span></div>`,
    );
  }
}
for (const variant of ["primary", "secondary"]) {
  for (const state of ["default", "hovered", "selected", "disabled", "focus-visible"]) {
    add(
      `tabs-${variant}-${state}`,
      `<div class="tabs tabs--${variant}"><div class="tabs__list-container"><div class="tabs__list"><button class="tabs__tab" data-${state}="true" data-probe>待批改</button></div></div></div>`,
    );
  }
}
for (const color of ["default", "accent", "success", "warning", "danger"]) {
  for (const variant of ["primary", "secondary", "tertiary", "soft"]) {
    add(
      `chip-${color}-${variant}`,
      `<span class="chip chip--${color} chip--${variant}" data-probe>已批改</span>`,
    );
  }
}
for (const state of ["default", "hovered", "focus-visible", "disabled", "active", "pressed"]) {
  add(
    `pagination-${state}`,
    `<button class="pagination__link" ${state === "disabled" ? 'aria-disabled="true"' : ""} data-${state}="true" data-probe>2</button>`,
  );
}
for (const state of ["default", "hovered", "focus-visible", "disabled", "current"]) {
  add(
    `breadcrumbs-${state}`,
    `<nav class="breadcrumbs"><a class="breadcrumbs__link link" ${state === "disabled" ? 'aria-disabled="true"' : ""} data-${state}="true" data-probe>课程</a></nav>`,
  );
}
const collectionFixtureCount = fixtures.length;

for (const parent of ["background", "surface", "surface-secondary", "surface-tertiary"]) {
  for (const color of ["accent", "success", "warning", "danger"]) {
    for (const state of ["normal", "hover"]) {
      add(
        `contrast-${parent}-${color}-${state}`,
        `<div style="background:var(--${parent})"><span style="color:var(--${color}-soft-foreground);background:var(--${color}-soft${state === "hover" ? "-hover" : ""})" data-probe>状态文字</span></div>`,
      );
    }
  }
}
const invariants = [
  "padding",
  "gap",
  "minHeight",
  "fontSize",
  "lineHeight",
  "fontWeight",
  "letterSpacing",
  "opacity",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "transform",
  "cursor",
  "outlineWidth",
  "outlineStyle",
  "outlineOffset",
];
let browser;
let baselineCss;
let themeCss;

before(async () => {
  baselineCss = (
    await docsRequire("postcss")([docsRequire("@tailwindcss/postcss")()]).process(
      '@import "tailwindcss"; @import "@heroui/styles"; :root {--font-sans: Inter, sans-serif} body {padding:32px;color:var(--foreground);background:var(--background);font-family:var(--font-sans)}',
      {from},
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
});

async function setup(mode = "light") {
  const page = await browser.newPage();

  await page.setContent(
    `<html class="${mode}"><head></head><body>${fixtures.map(({html, id}) => `<div data-sample="${id}">${html}</div>`).join("")}</body></html>`,
  );
  await page.addStyleTag({content: baselineCss});
  await page.mouse.move(0, 0);

  return page;
}
async function snapshot(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(
      document.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });

  return page.evaluate(
    (properties) => {
      const canvas = document.createElement("canvas");

      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", {willReadFrequently: true});

      // Chromium resolves OKLCH/color-mix; canvas converts the result to sRGB.
      // Alpha backgrounds and element opacity are composited before contrast.
      function rgba(color) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);

        return [...context.getImageData(0, 0, 1, 1).data];
      }
      function blend(foreground, background, opacity = 1) {
        const alpha = ((foreground[3] ?? 255) / 255) * opacity;

        return foreground
          .slice(0, 3)
          .map((channel, index) => channel * alpha + background[index] * (1 - alpha));
      }
      function background(element) {
        return element
          ? blend(
              rgba(getComputedStyle(element).backgroundColor),
              background(element.parentElement),
            )
          : [255, 255, 255];
      }
      function luminance(rgb) {
        return rgb
          .slice(0, 3)
          .map((channel) => {
            channel /= 255;

            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      }

      return Object.fromEntries(
        [...document.querySelectorAll("[data-sample]")].map((sample) => [
          sample.dataset.sample,
          [...sample.querySelectorAll("[data-probe]")].map((element) => {
            const style = getComputedStyle(element);
            const paper = background(element);
            let opacity = 1;

            for (let parent = element; parent; parent = parent.parentElement)
              opacity *= +getComputedStyle(parent).opacity;
            const ink = blend(rgba(style.color), paper, opacity);
            const a = luminance(ink),
              b = luminance(paper);

            return {
              ...Object.fromEntries(properties.map((property) => [property, style[property]])),
              contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            };
          }),
        ]),
      );
    },
    [...invariants, "backgroundColor", "color", "fontFamily", "borderRadius"],
  );
}

test("93 collection state fixtures keep original light/dark unchanged after import and theme removal", async () => {
  assert.equal(collectionFixtureCount, 93);
  for (const mode of ["light", "dark"]) {
    const page = await setup(mode);

    try {
      const original = await snapshot(page);

      await page.addStyleTag({content: themeCss});
      assert.deepEqual(await snapshot(page), original);
      await page.evaluate(() => {
        document.documentElement.className = "light";
        document.documentElement.dataset.rainTheme = "light";
      });
      await snapshot(page);
      await page.evaluate((mode) => {
        delete document.documentElement.dataset.rainTheme;
        document.documentElement.className = mode;
      }, mode);
      assert.deepEqual(await snapshot(page), original);
    } finally {
      await page.close();
    }
  }
});

test("Rain collection states retain spacing, type scale, disabled opacity, focus geometry and motion", async () => {
  const page = await setup();

  try {
    const original = await snapshot(page);

    await page.addStyleTag({content: themeCss});
    await page.evaluate(() => {
      document.documentElement.dataset.rainTheme = "light";
    });
    const rain = await snapshot(page);

    for (const [id, probes] of Object.entries(original)) {
      probes.forEach((probe, index) => {
        for (const key of invariants)
          assert.equal(rain[id][index][key], probe[key], `${id}[${index}].${key}`);
      });
    }
    assert.equal(rain["card-default"][0].borderRadius, "16px");
    assert.equal(rain["table-primary-default"][0].borderRadius, "12px 0px 0px 12px");
    for (const id of [
      "list-box-item-default-default",
      "menu-item-default-default",
      "tag-default-default",
      "tabs-primary-default",
      "chip-default-primary",
      "pagination-default",
    ]) {
      assert.equal(
        rain[id][0].borderRadius,
        original[id][0].borderRadius,
        `${id} retains its upstream inline radius`,
      );
    }
  } finally {
    await page.close();
  }
});

test("soft status text stays readable on all four Rain surfaces in normal and hover fills", async () => {
  const page = await setup();

  try {
    await page.addStyleTag({content: themeCss});
    await page.evaluate(() => {
      document.documentElement.dataset.rainTheme = "light";
    });
    const rain = await snapshot(page);
    const failures = Object.entries(rain)
      .filter(([id]) => id.startsWith("contrast-"))
      .flatMap(([id, probes]) =>
        probes
          .filter((probe) => probe.contrast < 4.5)
          .map((probe) => ({contrast: +probe.contrast.toFixed(3), id})),
      );

    assert.deepEqual(
      failures,
      [],
      "Normal-sized soft status text must reach 4.5:1 after compositing its actual parent surface",
    );
  } finally {
    await page.close();
  }
});

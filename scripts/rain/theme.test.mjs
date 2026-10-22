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
const postcss = docsRequire("postcss");
const tailwind = docsRequire("@tailwindcss/postcss");
const from = fileURLToPath(new URL("../../packages/storybook/theme-fixture.css", import.meta.url));
const themePath = new URL("../../packages/rain-theme/index.css", import.meta.url);
const fixture = `
  <button id="primary" class="button button--primary">确定</button>
  <button id="disabled" class="button button--primary" disabled data-disabled="true">禁用</button>
  <input id="field" class="input" placeholder="请输入" />
  <div id="card" class="card">课程卡片</div>
  <span id="radio" class="radio__control"></span>
  <span id="checkbox" class="checkbox__control"></span>
  <span id="avatar" class="avatar">张</span>
  <span id="switch" class="switch__control"></span>
  <span id="keyData" data-rain-key-data>86.5</span><span id="unit">分</span>`;
const invariants = [
  "height",
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
  "transform",
  "cursor",
];
let browser;
let baselineCss;
let themeCss;

before(async () => {
  const result = await postcss([tailwind()]).process(
    '@import "tailwindcss"; @import "@heroui/styles"; :root { --font-sans: Inter, sans-serif; } body { font-family: var(--font-sans); color: var(--foreground); }',
    {from},
  );

  baselineCss = result.css;
  themeCss = await readFile(themePath, "utf8");
  browser = await chromium.launch({headless: true});
});

after(async () => {
  await browser?.close();
});

async function setup(mode = "light") {
  const page = await browser.newPage();

  await page.setContent(`<html class="${mode}"><head></head><body>${fixture}</body></html>`);
  await page.addStyleTag({content: baselineCss});
  await page.mouse.move(1200, 700);

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
    (properties) =>
      Object.fromEntries(
        [...document.querySelectorAll("[id]")].map((el) => {
          const style = getComputedStyle(el);

          return [el.id, Object.fromEntries(properties.map((key) => [key, style[key]]))];
        }),
      ),
    [...invariants, "backgroundColor", "color", "fontFamily", "borderRadius"],
  );
}

test("import is inert in original light and dark; removing the brand restores exact computed styles", async () => {
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

test("Rain changes brand roles, font identity and button/container/field radii without changing geometry or motion", async () => {
  const page = await setup();

  try {
    const original = await snapshot(page);

    await page.addStyleTag({content: themeCss});
    await page.evaluate(() => {
      document.documentElement.dataset.rainTheme = "light";
    });
    const rain = await snapshot(page);

    assert.equal(rain.primary.backgroundColor, "rgb(21, 97, 248)");
    assert.match(rain.primary.fontFamily, /PingFang SC/);
    assert.match(rain.keyData.fontFamily, /LINE Seed JP App_OTF/);
    assert.match(rain.unit.fontFamily, /PingFang SC/);
    assert.equal(rain.card.borderRadius, "16px");
    assert.equal(rain.field.borderRadius, "6px");
    assert.equal(rain.primary.borderRadius, "10px");
    for (const [id, styles] of Object.entries(original)) {
      for (const key of invariants) assert.equal(rain[id][key], styles[key], `${id}.${key}`);
    }
    for (const id of ["radio", "avatar", "switch", "checkbox"]) {
      assert.equal(
        rain[id].borderRadius,
        original[id].borderRadius,
        `${id} retains its original shape`,
      );
    }
  } finally {
    await page.close();
  }
});

test("body-level overlay inherits Rain colors/radii and native keyboard focus remains usable", async () => {
  const page = await setup();

  try {
    await page.addStyleTag({content: themeCss});
    await page.evaluate(() => {
      document.documentElement.dataset.rainTheme = "light";
      const portal = document.createElement("div");

      portal.id = "portal";
      portal.className = "popover";
      portal.textContent = "浮层内容";
      document.body.appendChild(portal);
    });
    const portal = await page.locator("#portal").evaluate((el) => {
      const style = getComputedStyle(el);

      return {color: style.color, font: style.fontFamily, radius: style.borderRadius};
    });

    assert.equal(portal.color, "rgb(20, 35, 60)");
    assert.equal(portal.radius, "16px");
    assert.match(portal.font, /PingFang SC/);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "primary");
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.id), "field");
  } finally {
    await page.close();
  }
});

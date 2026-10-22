/* global document, getComputedStyle */
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
const pickerNames = ["date-picker", "date-range-picker", "color-picker"];
const fixture =
  pickerNames
    .map(
      (name) => `
      <div id="${name}" class="${name}__popover" data-slot="${name}-popover">
        <span id="${name}-radio" class="radio__control"></span>
        <span id="${name}-avatar" class="avatar"></span>
        <button id="${name}-button" class="button">Continue</button>
        <span id="${name}-switch" class="switch__control"></span>
      </div>`,
    )
    .join("") +
  ["primary", "secondary"]
    .map(
      (variant) => `
    <div id="table-${variant}" class="table-root table-root--${variant}">
      <table class="table__content"><tbody class="table__body"><tr class="table__row">
        <td class="table__cell">学生作业</td><td class="table__cell">86 分</td>
      </tr></tbody></table>
    </div>`,
    )
    .join("");
const properties = [
  "borderRadius",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "borderWidth",
  "boxShadow",
  "overflowX",
  "overflowY",
  "opacity",
  "pointerEvents",
  "animationName",
  "animationDuration",
  "animationTimingFunction",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
];
let browser;
let baselineCss;
let themeCss;

before(async () => {
  baselineCss = (
    await postcss([tailwind()]).process('@import "tailwindcss"; @import "@heroui/styles";', {
      from,
    })
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

async function snapshot(page) {
  return page.evaluate(
    (properties) =>
      Object.fromEntries(
        [...document.querySelectorAll("[id]")].map((element) => {
          const style = getComputedStyle(element);

          return [element.id, Object.fromEntries(properties.map((key) => [key, style[key]]))];
        }),
      ),
    properties,
  );
}

test("container theme import leaves original light and dark computed styles unchanged", async () => {
  for (const mode of ["light", "dark"]) {
    const page = await browser.newPage();

    try {
      await page.setContent(`<html class="${mode}"><head></head><body>${fixture}</body></html>`);
      await page.addStyleTag({content: baselineCss});
      const original = await snapshot(page);

      for (const name of pickerNames) assert.equal(original[name].borderRadius, "20px");
      assert.equal(original["table-primary"].borderRadius, "20px");
      assert.equal(original["table-secondary"].borderRadius, "0px");
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

for (const name of pickerNames) {
  test(`Rain ${name} panel uses 16px without changing nested circles or pills`, async () => {
    const page = await browser.newPage();

    try {
      await page.setContent(`<html class="light"><head></head><body>${fixture}</body></html>`);
      await page.addStyleTag({content: baselineCss});
      const original = await snapshot(page);

      await page.addStyleTag({content: themeCss});
      await page.evaluate(() => {
        document.documentElement.dataset.rainTheme = "light";
      });
      const rain = await snapshot(page);

      assert.equal(rain[name].borderRadius, "16px", `${name} panel radius`);
      for (const property of properties.filter((key) => key !== "borderRadius")) {
        assert.equal(rain[name][property], original[name][property], `${name}.${property}`);
      }
      for (const part of ["radio", "avatar", "button", "switch"]) {
        assert.deepEqual(rain[`${name}-${part}`], original[`${name}-${part}`], `${name} ${part}`);
      }
    } finally {
      await page.close();
    }
  });
}

for (const variant of ["primary", "secondary"]) {
  test(`Rain ${variant} table retains its inner/outer corner relationship`, async () => {
    const page = await browser.newPage();

    try {
      await page.setContent(`<html class="light"><head></head><body>${fixture}</body></html>`);
      await page.addStyleTag({content: baselineCss});
      const original = await snapshot(page);

      await page.addStyleTag({content: themeCss});
      await page.evaluate(() => {
        document.documentElement.dataset.rainTheme = "light";
      });
      const rain = await snapshot(page);
      const id = `table-${variant}`;

      assert.equal(rain[id].borderRadius, variant === "primary" ? "16px" : "0px");
      for (const property of properties.filter((key) => key !== "borderRadius")) {
        assert.equal(rain[id][property], original[id][property], `${id}.${property}`);
      }
      const innerRadius = await page
        .locator(`#${id} td`)
        .first()
        .evaluate((element) => getComputedStyle(element).borderTopLeftRadius);

      assert.equal(innerRadius, variant === "primary" ? "12px" : "0px");
    } finally {
      await page.close();
    }
  });
}

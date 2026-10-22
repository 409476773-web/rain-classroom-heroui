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
const evidence = new URL(
  "../../evidence/runtime/rain-theme-state-audit-2026-10-19/",
  import.meta.url,
);
const fixtures = [];
const add = (id, html, details) => fixtures.push({html, id, ...details});
const states = ["default", "hovered", "focused", "disabled", "invalid", "invalid-focused"];
const attributes = (state, focus = "focused") =>
  [
    state.includes("invalid") ? 'data-invalid="true"' : "",
    state.includes("focused") ? `data-${focus}="true"` : "",
    state === "hovered" ? 'data-hovered="true"' : "",
    state === "disabled" ? 'data-disabled="true"' : "",
  ].join(" ");

// These are source-matched CSS state fixtures, not React Aria interaction tests.
// InputGroup has no data-attribute equivalent for its :has(input:focus) rule;
// its focus states are tested separately with native focus below.
for (const variant of ["primary", "secondary"]) {
  for (const family of [
    "input",
    "textarea",
    "input-group",
    "search-field",
    "number-field",
    "select",
    "combo-box",
    "autocomplete",
    "date-input-group",
    "color-input-group",
  ]) {
    for (const state of states) {
      if (family === "input-group" && state.includes("focused")) continue;
      const id = `${family}-${variant}-${state}`;
      let html;

      if (["input", "textarea"].includes(family)) {
        html = `<${family} class="${family} ${family}--${variant}" ${attributes(state)} data-probe="control" placeholder="请输入">${family === "textarea" ? "评语</textarea>" : ""}`;
      } else if (family === "combo-box") {
        html = `<div class="combo-box"><div class="combo-box__input-group"><input class="input input--${variant}" data-slot="input" ${attributes(state)} data-probe="control" placeholder="查找课程" /></div></div>`;
      } else if (["select", "autocomplete"].includes(family)) {
        html = `<div class="${family} ${family}--${variant}" ${state.includes("invalid") ? 'data-invalid="true"' : ""}><button class="${family}__trigger" ${attributes(state, "focus-visible")} data-probe="control"><span class="${family}__value" data-placeholder="true" data-probe="placeholder">选择课程</span></button></div>`;
      } else {
        const compound = ["search-field", "number-field"].includes(family);
        const group = compound ? `${family}__group` : family;

        html = `${compound ? `<div class="${family} ${family}--${variant}">` : ""}<div class="${group}${compound ? "" : ` ${family}--${variant}`}" ${attributes(state, "focus-within")} data-probe="control"><input class="${family}__input" data-slot="${family}-input" placeholder="请输入" /></div>${compound ? "</div>" : ""}`;
      }
      add(id, html, {family, kind: "field", state, variant});
    }
  }
}

for (const family of ["checkbox", "radio", "switch"]) {
  const toggleStates = [
    "default",
    "hovered",
    "focused",
    "selected",
    "selected-hovered",
    "disabled",
    "disabled-selected",
  ];

  if (family !== "switch") toggleStates.push("invalid", "invalid-selected");
  if (family === "checkbox") toggleStates.push("indeterminate", "invalid-indeterminate");
  for (const variant of family === "switch" ? ["primary"] : ["primary", "secondary"]) {
    for (const state of toggleStates) {
      const attrs = ["selected", "invalid", "disabled", "indeterminate"]
        .filter((value) => state.split("-").includes(value))
        .map((value) => `data-${value}="true"`)
        .join(" ");
      const contentAttrs = state.includes("hovered")
        ? 'data-hovered="true"'
        : state === "focused"
          ? 'data-focus-visible="true"'
          : "";
      const indicator =
        family === "switch"
          ? '<span class="switch__thumb" data-probe="indicator"></span>'
          : `<span class="${family}__indicator" data-probe="indicator" ${family === "radio" ? 'data-pseudo="before"' : ""}>${family === "checkbox" ? '<svg data-slot="checkbox-default-indicator--checkmark" data-probe="checkmark"></svg>' : ""}</span>`;
      const html = `<div class="${family === "radio" ? `radio-group radio-group--${variant}` : ""}"><div class="${family} ${family}--${variant}" ${attrs} data-probe="root"><div class="${family}__content" data-slot="${family}-content" ${contentAttrs}><span class="${family}__control" data-probe="control" ${family === "checkbox" ? 'data-pseudo="before"' : ""}>${indicator}</span><span data-slot="label">选项</span></div></div></div>`;

      add(`${family}-${variant}-${state}`, html, {family, kind: "toggle", state, variant});
    }
  }
}
for (const state of ["default", "focused", "disabled", "invalid", "invalid-focused"]) {
  add(
    `date-segment-${state}`,
    `<div class="date-input-group"><span class="date-input-group__segment" ${attributes(state)} data-probe="control">10</span></div>`,
    {family: "date-segment", kind: "segment", state},
  );
}

const preserved = [
  "height",
  "minHeight",
  "padding",
  "gap",
  "fontSize",
  "lineHeight",
  "fontWeight",
  "letterSpacing",
  "borderWidth",
  "opacity",
  "pointerEvents",
  "cursor",
  "outlineWidth",
  "outlineStyle",
  "outlineOffset",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "animationName",
  "animationDuration",
  "transform",
  "scale",
];
const properties = [
  ...preserved,
  "boxShadow",
  "backgroundColor",
  "color",
  "outlineColor",
  "borderRadius",
];
let browser;
let baselineCss;
let themeCss;
const records = [];

before(async () => {
  baselineCss = (
    await docsRequire("postcss")([docsRequire("@tailwindcss/postcss")()]).process(
      '@import "tailwindcss"; @import "@heroui/styles"; body {color:var(--foreground); background:var(--background)} [data-sample] {width:280px;margin-bottom:10px}',
      {from: fileURLToPath(new URL("../../packages/storybook/forms-fixture.css", import.meta.url))},
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
    new URL("forms-css-states.json", evidence),
    JSON.stringify(
      {
        fixtures: fixtures.map(({html: _html, ...rest}) => rest),
        records,
        scope:
          "Source-matched data-state CSS fixtures; InputGroup focus alone uses native DOM focus. Not React Aria interaction coverage.",
      },
      null,
      2,
    ) + "\n",
  );
});
async function setup(
  mode = "light",
  html = fixtures.map(({html, id}) => `<div data-sample="${id}">${html}</div>`).join(""),
) {
  const page = await browser.newPage();

  await page.setContent(`<html class="${mode}"><head></head><body>${html}</body></html>`);
  await page.addStyleTag({content: baselineCss});
  await page.mouse.move(1200, 700);

  return page;
}
async function snapshot(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });

  return page.evaluate(
    (properties) =>
      Object.fromEntries(
        [...document.querySelectorAll("[data-sample]")].map((sample) => [
          sample.dataset.sample,
          Object.fromEntries(
            [...sample.querySelectorAll("[data-probe]")].flatMap((element) => {
              const read = (pseudo) => {
                const style = getComputedStyle(element, pseudo);

                return Object.fromEntries(
                  properties.map((property) => [property, style[property]]),
                );
              };

              return [
                [element.dataset.probe, read(null)],
                ...(element.dataset.pseudo
                  ? [[`${element.dataset.probe}::before`, read("::before")]]
                  : []),
              ];
            }),
          ),
        ]),
      ),
    properties,
  );
}
function comparePreserved(original, rain) {
  for (const [id, probes] of Object.entries(original)) {
    for (const [part, values] of Object.entries(probes)) {
      for (const property of preserved)
        assert.equal(rain[id][part][property], values[property], `${id}/${part}.${property}`);
      const stripColor = (value) => value.replace(/(?:rgba?|oklch|oklab|color)\([^)]*\)/g, "COLOR");

      assert.equal(
        stripColor(rain[id][part].boxShadow),
        stripColor(values.boxShadow),
        `${id}/${part} ring geometry`,
      );
    }
  }
}

test(`${fixtures.length} form CSS state fixtures leave original light/dark unchanged after import and switching back`, async () => {
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
        document.documentElement.className = mode;
        delete document.documentElement.dataset.rainTheme;
      }, mode);
      assert.deepEqual(await snapshot(page), original);
    } finally {
      await page.close();
    }
  }
});

test("Rain form states retain dimensions, disabled behavior, focus/error geometry, pseudo-element shapes and motion", async () => {
  const page = await setup();

  try {
    const original = await snapshot(page);

    await page.addStyleTag({content: themeCss});
    await page.evaluate(() => {
      document.documentElement.dataset.rainTheme = "light";
    });
    const rain = await snapshot(page);

    comparePreserved(original, rain);
    for (const {family, id, kind, state, variant} of fixtures) {
      const {control, root} = rain[id];

      if (kind === "field") {
        assert.equal(control.borderRadius, "6px", id);
        if (state.includes("focused"))
          assert.match(
            control.boxShadow,
            // Upstream DateInputGroup's more specific :not(:has(trigger)) focus
            // selector keeps a focus-colored ring alongside the danger outline.
            state.includes("invalid") && family !== "date-input-group"
              ? /rgb\(181, 42, 54\)/
              : /rgb\(61, 123, 255\)/,
            id,
          );
        if (state.includes("invalid")) {
          assert.equal(control.outlineColor, "rgb(181, 42, 54)", id);
          assert.equal(control.outlineWidth, "1px", id);
        }
        if (state === "disabled") {
          assert.equal(control.opacity, "0.5", id);
          assert.equal(control.pointerEvents, "none", id);
        }
        if (state === "default")
          assert.equal(
            control.backgroundColor,
            variant === "primary" ? "rgb(255, 255, 255)" : "rgb(237, 243, 250)",
            id,
          );
        if (state === "hovered")
          assert.notEqual(
            control.backgroundColor,
            rain[`${family}-${variant}-default`].control.backgroundColor,
            id,
          );
      } else if (kind === "toggle") {
        for (const [part, styles] of Object.entries(rain[id]))
          assert.equal(styles.borderRadius, original[id][part].borderRadius, `${id}/${part} shape`);
        if (state.includes("disabled")) {
          assert.equal(root.opacity, "0.5", id);
          assert.equal(root.pointerEvents, "none", id);
        }
        if (state === "focused") assert.match(control.boxShadow, /rgb\(61, 123, 255\)/, id);
        if (family !== "switch" && state === "invalid")
          assert.equal(control.outlineColor, "rgb(181, 42, 54)", id);
        if (state === "selected") {
          const fill = family === "checkbox" ? rain[id]["control::before"] : control;

          assert.equal(fill.backgroundColor, "rgb(21, 97, 248)", id);
          const indicator =
            family === "radio"
              ? rain[id]["indicator::before"].backgroundColor
              : family === "checkbox"
                ? rain[id].checkmark.color
                : rain[id].indicator.backgroundColor;

          assert.equal(indicator, "rgb(255, 255, 255)", id);
        }
        if (family === "checkbox" && variant === "primary" && state === "invalid-selected") {
          assert.equal(rain[id]["control::before"].backgroundColor, "rgb(181, 42, 54)", id);
          assert.equal(rain[id].checkmark.color, "rgb(255, 255, 255)", id);
        }
      } else {
        if (state === "focused") {
          assert.equal(control.backgroundColor, "rgb(234, 242, 255)", id);
          assert.equal(control.color, "rgb(15, 85, 223)", id);
        }
        if (state.includes("invalid")) assert.equal(control.color, "rgb(181, 42, 54)", id);
      }
    }
    records.push({case: "state-matrix", original, rain});
  } finally {
    await page.close();
  }
});

test("InputGroup native focus applies the correct Rain normal/error ring without changing the original focus mechanism", async () => {
  for (const variant of ["primary", "secondary"]) {
    for (const invalid of [false, true]) {
      const page = await setup(
        "light",
        `<div data-sample="group"><div class="input-group input-group--${variant}" ${invalid ? 'data-invalid="true"' : ""} data-probe="control"><input aria-label="Grouped input" data-slot="input-group-input" class="input-group__input" /></div></div>`,
      );

      try {
        await page.getByRole("textbox", {name: "Grouped input"}).focus();
        const original = await snapshot(page);

        await page.addStyleTag({content: themeCss});
        await page.evaluate(() => {
          document.documentElement.dataset.rainTheme = "light";
        });
        const rain = await snapshot(page);

        comparePreserved(original, rain);
        assert.match(
          rain.group.control.boxShadow,
          invalid ? /rgb\(181, 42, 54\)/ : /rgb\(61, 123, 255\)/,
        );
        assert.equal(rain.group.control.borderRadius, "6px");
        records.push({
          case: `native-input-group-${variant}-${invalid ? "invalid" : "normal"}`,
          original,
          rain,
        });
      } finally {
        await page.close();
      }
    }
  }
});

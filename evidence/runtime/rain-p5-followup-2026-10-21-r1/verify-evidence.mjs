// Assertions on saved, bounded browser observations; this does not drive a browser.
import assert from "node:assert/strict";
import {readFileSync, writeFileSync} from "node:fs";

const read = (name) => JSON.parse(readFileSync(new URL(`${name}.json`, import.meta.url)));
const checks = [];
const check = (name, condition) => {
  assert.ok(condition, name);
  checks.push(name);
};
const inputs = (name) => read(name).nodes.filter((node) => node.tag === "INPUT");

check("Switch Space selects", inputs("switch-controlled-space-on")[0].checked);
check("Switch Space clears", !inputs("switch-controlled-space-off")[0].checked);
check(
  "SwitchGroup retains independent values",
  inputs("switchgroup-independent")
    .map((n) => n.checked)
    .join() === "true,true,false",
);
check(
  "CheckboxGroup retains two choices",
  inputs("checkboxgroup-multiple").filter((n) => n.checked).length === 2,
);
check(
  "Checkbox required error visible",
  read("checkboxgroup-required-empty").text.includes("Please select at least"),
);
check(
  "Checkbox error removes after selection",
  !read("checkboxgroup-corrected").text.includes("Please select at least"),
);
check(
  "Radio arrow selects Pro",
  inputs("radiogroup-corrected-arrow").find((n) => n.checked)?.value === "pro",
);
check(
  "Radio error removes after selection",
  !read("radiogroup-corrected-arrow").text.includes("Choose a subscription"),
);
check(
  "Autocomplete filters to empty state",
  read("autocomplete-empty").text.includes("No results found"),
);
check(
  "Autocomplete keyboard skips disabled Cat",
  read("autocomplete-keyboard-portal")
    .find((n) => n.activeDescendant)
    ?.activeDescendant.endsWith("option-bird"),
);
check(
  "Autocomplete selects Bird",
  read("autocomplete-selected-settled").text.includes("Animal\nBird"),
);
check(
  "ComboBox skips disabled Cat",
  read("combobox-keyboard-portal")
    .find((n) => n.activeDescendant)
    ?.activeDescendant.endsWith("option-bird"),
);
check(
  "ComboBox filter targets Elephant",
  read("combobox-filtered")
    .find((n) => n.activeDescendant)
    ?.activeDescendant.endsWith("option-elephant"),
);
check(
  "ComboBox Escape retains input focus",
  read("combobox-escape-settled").active.role === "combobox",
);
check(
  "Popover visible bare text uses Rain foreground",
  read("popover-visible-after").every((n) => n.color === "rgb(20, 35, 60)"),
);
for (const theme of ["light", "dark"]) {
  const before = read(`popover-original-${theme}-before`);
  const after = read(`popover-original-${theme}-after`);
  check(
    `Popover original ${theme} sampled colors and fonts restore`,
    before.length === after.length &&
      before.every((n, i) => n.color === after[i].color && n.font === after[i].font),
  );
}
for (const name of ["autocomplete-visible-after-color-fix", "combobox-visible-after-color-fix"]) {
  const labels = read(name).filter((n) => n.role === "option");
  check(
    `${name} plain option text inherits Rain`,
    labels.length === 6 && labels.every((n) => n.color === "rgb(20, 35, 60)"),
  );
}
check(
  "Tooltip keyboard text inherits Rain",
  read("tooltip-keyboard-visible").every((n) => n.color === "rgb(20, 35, 60)"),
);
check(
  "Popover Escape restores trigger",
  read("popover-escape-after").active.label === "Popover trigger",
);
check("Tooltip Escape retains trigger", read("tooltip-escape").active.label === "Tooltip trigger");
check("Dropdown Escape restores trigger", read("dropdown-escape").active.label === "Menu");
check(
  "AlertDialog cancel restores trigger",
  read("alertdialog-cancel-restores").active.class.includes("button--danger"),
);
check(
  "DateField past date errors",
  read("datefield-past-invalid").text.includes("Date must be today"),
);
check(
  "DateField today recovers",
  read("datefield-today-corrected").text.includes("Enter a date from today"),
);
check("TimeField 08 errors", read("timefield-eight-invalid").text.includes("Time must be between"));
check("TimeField 09 recovers", read("timefield-nine-valid").text.includes("Enter a time between"));
check(
  "DateRange end edit is controlled",
  read("daterange-end-edited").text.includes("2026-10-21 -> 2026-10-26"),
);
check(
  "DateRange Escape restores trigger",
  read("daterange-escape").active.class === "date-range-picker__trigger",
);
check(
  "Slider two handles step independently",
  read("slider-range-stepped")
    .items.map((n) => n.value)
    .join() === "150,450",
);
check(
  "Slider lower handle stops at upper",
  read("slider-range-meets-end")
    .items.map((n) => n.value)
    .join() === "450,450",
);
check("Slider vertical up increments", read("slider-vertical-up").text === "Volume\n31");
check(
  "Accordion supports two expanded",
  read("accordion-two-open").nodes.filter((n) => n.expanded === "true").length === 2,
);
check(
  "Accordion closes one only",
  read("accordion-first-closed").nodes.filter((n) => n.expanded === "true").length === 1,
);
check(
  "DisclosureGroup switches one expanded",
  read("disclosuregroup-single-switch").nodes.filter((n) => n.expanded === "true").length === 1,
);
check("Pagination page 12 summary", read("pagination-last").text.includes("111-120 of 120"));
check(
  "Pagination page 12 disables Next",
  read("pagination-last").nodes.find((n) => n.text === "Next")?.disabled,
);
check(
  "ColorPicker Escape restores trigger",
  read("colorpicker-escape").active.class === "color-picker__trigger",
);
check("Color alpha Home is zero", read("colorslider-alpha-zero").text === "Alpha\n0%");
check("Color alpha End is one", read("colorslider-alpha-one").text === "Alpha\n100%");
check(
  "Color swatch updates selected data color",
  read("colorswatchpicker-keyboard").text === "Selected: #D946EF",
);
for (const component of ["progressbar", "progresscircle"]) {
  check(
    `${component} indeterminate has no fake current value`,
    read(`${component}-indeterminate`).nodes.find((n) => n.role === "progressbar")?.now === null,
  );
}
check(
  "Meter exposes 750 of 1000",
  read("meter-custom-value").nodes.some((n) => n.now === "750" && n.max === "1000"),
);
for (const name of ["release-cn-alpha34", "release-en-alpha34", "release-cn-v304"]) {
  const page = read(name);
  check(
    `${name} has rendered previews and no missing demo`,
    page.previews > 0 && page.missing.length === 0,
  );
}
check(
  "Current contrast samples retain low contrast finding",
  read("contrast-calculation").samples.length === 21 &&
    !read("contrast-calculation").allNormalTextAA,
);
check(
  "OTP fixture error text still present after edit",
  read("otp-edited-details").items.some(
    (n) =>
      n.id === "code-error" &&
      n.visible === "false" &&
      n.opacity === "1" &&
      n.text.includes("Invalid code"),
  ),
);
for (const name of [
  "autocomplete-original-light-escape-settled",
  "autocomplete-original-dark-escape-settled",
  "autocomplete-rain-escape-final",
]) {
  check(`${name} known focus limitation retained`, read(name).active.tag === "BODY");
}

writeFileSync(
  new URL("evidence-checks.json", import.meta.url),
  `${JSON.stringify({scope: "Saved observation assertions, not component tests or a fresh browser run", count: checks.length, checks}, null, 2)}\n`,
);
process.stdout.write(`${checks.length} saved-observation assertions passed\n`);

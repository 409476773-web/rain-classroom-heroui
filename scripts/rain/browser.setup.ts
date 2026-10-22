import {beforeEach, expect} from "vitest";

import "../../packages/react/src/styles.css";
// Match the consuming apps: brand CSS follows the complete upstream stylesheet.
// eslint-disable-next-line import/order
import "../../packages/rain-theme/index.css";

beforeEach(() => {
  document.documentElement.classList.remove("dark");
  document.documentElement.classList.add("light");
  document.documentElement.dataset.rainTheme = "light";
  document.documentElement.dataset.theme = "light";
  expect(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim()).toBe(
    "#1561f8",
  );
});

import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

import {mergeConfig} from "vitest/config";

import upstream from "../../packages/react/vitest.config";

const here = dirname(fileURLToPath(import.meta.url));

// Run the unmodified upstream interaction suites with the real Rain stylesheet.
export default mergeConfig(upstream.test!.projects![1] as object, {
  root: resolve(here, "../../packages/react"),
  optimizeDeps: {
    include: ["react-aria-components/TextField", "react-aria-components/TextArea"],
  },
  test: {
    name: "rain-browser",
    include: [
      "tests/**/*.browser.test.{ts,tsx}",
      resolve(here, "../../packages/storybook/.storybook/rain-states.browser.test.tsx"),
    ],
    setupFiles: [resolve(here, "browser.setup.ts")],
  },
});

// Supplemental run only: upstream expects Chromium 153 / revision 1243.
// This local evidence config uses the pre-existing Chromium 151 / revision 1234.
// The upstream component sources, tests and Vitest configuration stay unchanged.
import upstream from "../../../../packages/react/vitest.config.ts";
import {playwright} from "../../../../packages/testing/node_modules/@vitest/browser-playwright";

export default {
  ...upstream,
  test: {
    ...upstream.test,
    projects: upstream.test.projects.map((project) => project.test?.name === "react-browser" ? {
      ...project,
      test: {
        ...project.test,
        browser: {
          ...project.test.browser,
          provider: playwright({
            launchOptions: {
              executablePath: "/Users/wenchengkai/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell",
            },
          }),
        },
      },
    } : project),
  },
};

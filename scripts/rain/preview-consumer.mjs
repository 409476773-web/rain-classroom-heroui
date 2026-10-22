#!/usr/bin/env node
/* eslint-disable no-console -- This local preview reports its address. */
import assert from "node:assert/strict";
import {existsSync, readFileSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const delivery = path.resolve(root, process.argv[2] ?? "delivery/rain-heroui-local-2026-10-20-r2");
const port = Number(process.argv[3] ?? 6008);

assert.ok(Number.isInteger(port) && port > 0 && port < 65536, "Invalid local preview port");
const report = JSON.parse(readFileSync(path.join(delivery, "report.json"), "utf8"));
const consumer = report.temporaryConsumer;
const requireDocs = createRequire(path.join(root, "apps/docs/package.json"));
const requireReact = createRequire(path.join(root, "packages/react/package.json"));
const requireStorybook = createRequire(path.join(root, "packages/storybook/package.json"));
const {createServer} = await import(pathToFileURL(requireStorybook.resolve("vite")).href);
const {default: react} = await import(
  pathToFileURL(requireReact.resolve("@vitejs/plugin-react")).href
);
const tailwind = requireDocs("@tailwindcss/postcss");

assert.ok(
  existsSync(path.join(consumer, "example/App.tsx")),
  "The isolated package consumer no longer exists; prepare a new delivery first.",
);
// strictPort checks availability and fails without stopping an existing process.
const server = await createServer({
  configFile: false,
  css: {postcss: {plugins: [tailwind()]}},
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-aria", "react-aria-components", "tailwind-variants"],
  },
  root: path.join(consumer, "example"),
  server: {
    fs: {allow: [consumer, path.join(root, "node_modules")]},
    host: "127.0.0.1",
    port,
    strictPort: true,
  },
});

await server.listen();
writeFileSync(
  path.join(delivery, "preview-process.json"),
  `${JSON.stringify(
    {
      consumer,
      pid: process.pid,
      url: `http://127.0.0.1:${port}`,
    },
    null,
    2,
  )}\n`,
);
console.log(`Isolated archive consumer: http://127.0.0.1:${port}`);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await server.close();
    process.exit(0);
  });
}

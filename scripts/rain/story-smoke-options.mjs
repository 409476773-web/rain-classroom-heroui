import {createHash} from "node:crypto";
import {lstat, mkdir, readFile, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";

export function parseSmokeArgs(args, {cwd = process.cwd(), env = process.env} = {}) {
  const options = {
    base: env.STORYBOOK_URL || "http://127.0.0.1:6006",
    concurrency: 1,
    help: false,
    output: null,
    plan: false,
  };
  const seen = new Set();

  for (let index = 0; index < args.length; index++) {
    const name = args[index];

    if (!["--output", "--concurrency", "--help", "--plan"].includes(name))
      throw new Error(`Unknown argument: ${name}`);
    if (seen.has(name)) throw new Error(`Duplicate argument: ${name}`);
    seen.add(name);
    if (name === "--help" || name === "--plan") {
      options[name.slice(2)] = true;
      continue;
    }
    const value = args[++index];

    if (!value?.trim() || value.startsWith("--")) throw new Error(`Missing value for ${name}`);
    if (name === "--output") options.output = resolve(cwd, value);
    else {
      if (!/^[1-3]$/.test(value)) throw new Error("--concurrency must be an integer from 1 to 3");
      options.concurrency = Number(value);
    }
  }
  if (!options.help && !options.output)
    throw new Error("--output must explicitly name a new directory");

  return options;
}

export async function assertNewOutput(output) {
  try {
    await lstat(output);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  throw new Error(`Output already exists; refusing to overwrite: ${output}`);
}

export function reserveOutput(output) {
  // Atomic reservation rejects empty directories, files and even dangling symlinks.
  return mkdir(output);
}

export function writeNewJson(file, value) {
  return writeFile(file, `${JSON.stringify(value, null, 2)}\n`, {flag: "wx"});
}

export function storiesFromIndex(index) {
  if (!index?.entries || typeof index.entries !== "object" || Array.isArray(index.entries))
    throw new Error("Storybook index has no valid entries object");
  const stories = Object.values(index.entries).filter((entry) => entry?.type === "story");

  if (
    !stories.length ||
    stories.some(
      (story) =>
        !story.id ||
        typeof story.id !== "string" ||
        !story.title ||
        typeof story.title !== "string",
    )
  )
    throw new Error("Storybook index has no valid stories or contains malformed stories");

  return stories;
}

export async function readSourceInfo(root) {
  const hash = (content) => createHash("sha256").update(content).digest("hex");
  const files = [
    "packages/rain-theme/index.css",
    "pnpm-lock.yaml",
    "packages/react/src/components/tabs/tabs.tsx",
    "packages/styles/src/components/tabs/tabs.styles.ts",
  ];
  const actualSha256 = Object.fromEntries(
    await Promise.all(files.map(async (file) => [file, hash(await readFile(join(root, file)))])),
  );
  const inventoryBytes = await readFile(join(root, "docs/rain/inventory.json"));
  const inventory = JSON.parse(inventoryBytes);
  const manifests = await Promise.all(
    ["react", "styles", "rain-theme"].map(async (name) =>
      JSON.parse(await readFile(join(root, `packages/${name}/package.json`))),
    ),
  );

  return {
    actualSha256,
    inventory: {
      declaredInputFiles: inventory.upstream.inputFiles,
      declaredInputSha256: inventory.upstream.inputSha256,
      declaredLockfileSha256: inventory.upstream.lockfileSha256,
      kind: "recorded_input_summary_not_new_freeze",
      sha256: hash(inventoryBytes),
      summary: inventory.summary,
      upstreamCommit: inventory.upstream.commit,
    },
    versions: Object.fromEntries(manifests.map(({name, version}) => [name, version])),
  };
}

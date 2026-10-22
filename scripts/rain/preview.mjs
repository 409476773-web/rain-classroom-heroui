/* eslint-disable no-console -- This CLI reports preview addresses and service failures. */
import {spawn} from "node:child_process";
import {constants} from "node:fs";
import {copyFile} from "node:fs/promises";
import {createServer} from "node:net";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const host = "127.0.0.1";

function readPort(name, fallback) {
  const value = process.env[name] ?? String(fallback);
  const port = Number(value);

  if (!/^\d+$/.test(value) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} 必须是 1–65535 之间的端口号，当前值为 ${JSON.stringify(value)}。`);
  }

  return port;
}

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", (error) => {
      reject(new Error(`无法使用 ${host}:${port}（${error.code}）。请换端口或自行关闭占用服务。`));
    });
    server.listen({exclusive: true, host, port}, () => server.close(resolve));
  });
}

async function main() {
  const docsPort = readPort("RAIN_DOCS_PORT", 3100);
  const storybookPort = readPort("RAIN_STORYBOOK_PORT", 6006);

  if (docsPort === storybookPort) {
    throw new Error("Docs 与 Storybook 需要不同的端口。");
  }

  await Promise.all([checkPort(docsPort), checkPort(storybookPort)]);

  try {
    await copyFile(
      new URL("../../apps/docs/local-preview.env.example", import.meta.url),
      new URL("../../apps/docs/.env.local", import.meta.url),
      constants.COPYFILE_EXCL,
    );
    console.log("[local:preview] 已从示例创建 apps/docs/.env.local。");
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    console.log("[local:preview] 使用已有 apps/docs/.env.local，未覆盖。");
  }

  const children = [];
  let stopping = false;

  function signalChild(child, signal) {
    if (!child.pid) return;

    try {
      // Each service owns a process group, including pnpm and its dev-server workers.
      process.kill(-child.pid, signal);
    } catch (error) {
      if (error.code !== "ESRCH") console.error(`[local:preview] 清理进程失败：${error.message}`);
    }
  }

  function stop(code) {
    if (stopping) return;
    stopping = true;
    console.log("\n[local:preview] 正在关闭本次启动的预览服务…");
    children.forEach((child) => signalChild(child, "SIGTERM"));

    // Keep this timer alive so workers that ignore SIGTERM cannot outlive the launcher.
    setTimeout(() => {
      children.forEach((child) => signalChild(child, "SIGKILL"));
      process.exit(code);
    }, 2000);
  }

  process.once("SIGINT", () => stop(130));
  process.once("SIGTERM", () => stop(143));
  process.once("SIGHUP", () => stop(129));

  const services = [
    {
      args: ["--filter", "@heroui/docs", "dev", "--hostname", host, "--port", String(docsPort)],
      name: "Docs",
    },
    {
      args: [
        "--filter",
        "@heroui/storybook",
        "exec",
        "storybook",
        "dev",
        "--host",
        host,
        "--port",
        String(storybookPort),
        "--no-open",
        "--ci",
        "--exact-port",
      ],
      name: "Storybook",
    },
  ];

  console.log("[local:preview] 模式：local preview（强制开启），APP_ENV=development。");
  console.log(`[local:preview] Docs 启动地址：http://${host}:${docsPort}/docs/react`);
  console.log(`[local:preview] 中文文档：http://${host}:${docsPort}/cn/docs/react`);
  console.log(`[local:preview] 雨课堂组件中心：http://${host}:${docsPort}/cn/docs/react/rain`);
  console.log(`[local:preview] Storybook 启动地址：http://${host}:${storybookPort}/`);
  console.log("[local:preview] 等待下方服务就绪提示；按 Ctrl+C 同时退出。");

  for (const service of services) {
    const child = spawn("pnpm", service.args, {
      cwd: root,
      detached: true,
      env: {
        ...process.env,
        NEXT_PUBLIC_APP_ENV: "development",
        NEXT_PUBLIC_LOCAL_PREVIEW: "true",
        NEXT_PUBLIC_RAIN_STORYBOOK_URL: `http://${host}:${storybookPort}`,
        STORYBOOK_READY_ONLY: "false",
      },
      stdio: "inherit",
    });

    children.push(child);
    child.once("error", (error) => {
      console.error(`[local:preview] ${service.name} 无法启动：${error.message}`);
      stop(1);
    });
    child.once("exit", (code, signal) => {
      if (stopping) return;
      console.error(`[local:preview] ${service.name} 已退出（${signal ?? code}）。`);
      stop(code || 1);
    });
  }
}

main().catch((error) => {
  console.error(`[local:preview] ${error.message}`);
  process.exitCode = 1;
});

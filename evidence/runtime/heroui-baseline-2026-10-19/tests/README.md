# HeroUI 原版 React 行为测试

日期：2026-10-19，Asia/Shanghai。原版 jsdom、Client SSR 与匹配 Chromium 行为测试合计 **125 个文件、671 项测试全部通过**。范围为上游原版组件测试，不实施雨课堂主题，不修改组件实现、上游测试或锁文件。

## 当前结果

| 检查 | 文件 / 测试 | 退出状态 | 结论 |
| --- | --- | --- | --- |
| jsdom | 79 / 570 | 0 | 通过 |
| Client SSR | 34 / 54 | 0 | 通过；是客户端组件的服务端渲染冒烟，不是 RSC 验证 |
| Chromium 151.0.7922.34，Playwright revision 1234 | 12 / 47 | 0 | 补充验证通过；版本与上游要求不同，不替代匹配版本结果 |
| Chromium 153.0.8010.12，Playwright revision 1243 | 12 / 47 | 0 | 匹配版本通过，使用完全原版 Vitest 配置 |

jsdom 与 SSR 由同一个 `react-jsdom` 项目执行，合计 113 个文件、624 项测试。上述分组由 JSON 报告中的真实文件名和断言结果计算。正式基线总数不重复计算 Chromium 151 的补充运行。

浏览器套件为上游现有的 12 个文件：accordion、autocomplete、alert-dialog、drawer、dropdown、modal、popover、scroll-shadow、select、tag、toast、tooltip。覆盖范围不代表所有组件的全部浏览器交互都已测试。

## 运行方式与环境

- Node.js：v24.13.0；pnpm：10.26.2；Vitest：4.1.11；Playwright：1.63.0。
- 开始前已读取根 `AGENTS.md`、测试脚本与共享配置，并确认 `packages/styles/dist/index.js` 存在。
- jsdom 只使用 1 个 worker；浏览器文件串行、1 个 worker。两个测试套件未并行运行。
- `jsdom-ssr.command.json` 和各浏览器 `*.command.json` 保存完整参数、工作目录、开始/结束时间和退出状态；对应 `*.log` 保存完整合并输出；Vitest `*.json` 保存逐测试结果。
- `run-summary.json` 是汇总记录。`source-fingerprints-before.json` 与 `source-fingerprints-after.json` 记录组件源码、测试、配置和 lockfile 的 SHA256；全部测试完成后再次核验，未发现变化。
- 上游 jsdom 日志存在 React `act(...)` 警告；624 项测试均通过。没有为消除警告修改测试或组件。

## 浏览器下载问题与补充验证

上游默认 Playwright 安装器访问官方 CDN 连续 5 次在 30000ms 后超时，退出 1，见 `chromium-install.log` 与 `chromium-install.command.json`。系统 curl 对同一地址和 Google Storage 重定向能返回 200，说明资源存在，阻碍发生在本地下载路径；未将下载失败归为组件失败。

第一轮 curl 单连接下载吞吐约 50–80 KB/s，在 185 秒时主动中止，见 `chromium-curl-install.command.json`。随后对同一官方 Google Storage 文件分 8 段下载，各段检查 Content-Range 与文件长度，合并后匹配官方响应中的整包 MD5，并另记 SHA256，之后才解压使用。没有修改依赖版本或 lockfile，没有关闭 TLS 校验。

匹配版本安装已完成：98,831,293 字节；官方与实际 MD5（Base64）均为 `dew3XY0eautubimRYnqH9w==`；SHA256 为 `89d80a6d26ccd0ccfd51e22d9e1297283862af2b0cd91dce07459b35ca0059f2`。读取浏览器实际版本为 `Google Chrome for Testing 153.0.8010.12`，随后上游 `playwright install --only-shell chromium` 检查退出 0。详情见 `chromium-ranged-install.command.json`。

等待匹配版本期间，用缓存的 Chromium 151 完成补充行为验证。唯一覆盖配置是本目录的 `cached-browser.config.mts`，它复用上游配置，只指定已有浏览器路径；不改上游测试或组件。结果和实际/要求版本差异单独记录在 `browser-cached-1234.command.json`。最终匹配 Chromium 153 运行未使用该覆盖配置，12 个文件、47 项测试全部通过，Vitest 用时 8.18 秒；结果见 `browser-matching-1243.command.json`、`browser-matching-1243.log` 和 `browser-matching-1243.json`。

## 结论边界

本轮未测覆盖率阈值、Firefox、Safari、真实移动设备、屏幕阅读器、视觉对比或用户视觉接受。不能由这些结果推导雨课堂换肤完成、全组件视觉验收或生产发布资格。

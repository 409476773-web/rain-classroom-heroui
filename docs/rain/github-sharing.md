# GitHub 共享范围与版本身份

日期：2026-10-22。公开目标为 `409476773-web/rain-classroom-heroui`，首个标签为 `rain-v0.1.2-preview.1`。

## 共享内容

- 固定 HeroUI 3.2.6 的完整源码、现有原版文档／示例与本地改造。
- Rain Theme 0.1.2、两个已授权的 Tabs 源码补丁、主题控制器、组件中心和已确认的课堂练习批改组合。
- 冻结 r2 三个归档及许可证、SHA-256、来源与限定消费证据；旧归档仍作为历史记录保留。
- `examples/rain-starter` 是复用 r2 业务组合的最小 Vite 消费者，不添加另一套组件实现。其宿主绑定正文颜色／字体，不修改冻结包。

源码、归档和预览是不同交付层。归档是冻结 r2；之后的 Storybook 宿主修复和历史 release 引用修复位于仓库源码，不冒充归档已经重新打包。

## 未上传的内容

独立 AI 工具工作台原型没有该任务的提交／上传授权，因此此发布副本排除 `apps/docs/PRODUCT.md`、`app/(rain-prototypes)`、`rain-examples/ai-tool-workbench`、对应测试与计划；同时恢复发布副本 proxy 中仅为该原型新增的 `/rain/` 规则。本机原工作区、未提交记录和预览服务保持原状。

真实 `.env.local`、依赖、构建缓存和编译目录不进入仓库；只保留无服务密钥的示例配置。历史证据包含本机路径、临时目录和进程信息，仅用于说明原始验证环境，不是外部用户可访问地址，不提供真实课堂数据或服务凭据。截图没有做全量逐像素敏感信息认证。

## 自动任务与发布

本次只公开 GitHub 源码和预览版下载，不发布 npm，不部署站点。新仓库 GitHub Actions 保持关闭；原版 workflow 按原字节移至 `docs/upstream-workflows/` 作为来源参考保留，避免触发上游构建、发布或外部调度。未来启用 Actions、运行完整验收、部署在线文档或发布 npm，需单独安排。

## 清单可移植性

发布副本的清单工具排除截图／构建缓存，以上游固定提交识别来源文件，并在尚无本地生产索引时读取随库保存的历史索引。该索引只是历史对账依据，9 项差额仍保留，不能作为当前生产构建成功。生成资料在发布副本刷新；冻结的既有验收证据不被改写。

## 验证边界

已有 172 个 ESM 入口真实导入和指定页面的有限检查；P5 尚未整体完成。新环境联网安装、全库状态回归、当前生产构建、跨浏览器／辅助技术／触控均未据此通过。NodeNext、完整离线和字体文件也不是已承诺支持范围。

上游来源、根许可证和包元数据保持原样。根 LICENSE 为 Apache-2.0，组件包元数据为 MIT，具体边界见根 README 和 r2 说明；本地后缀不是新的官方 HeroUI 版本。

## 修改的上游文件

以下清单相对固定上游提交生成，表示本地改造或共享说明变更；不含新增 Rain 文件和完整历史证据。具体源码差异可通过 Git 历史查看。

- `AGENTS.md`
- `README.md`
- `apps/docs/content/docs/cn/react/components/index.mdx`
- `apps/docs/content/docs/cn/react/meta.json`
- `apps/docs/content/docs/cn/react/releases/v3-0-0-alpha-34.mdx`
- `apps/docs/content/docs/cn/react/releases/v3-0-4.mdx`
- `apps/docs/content/docs/en/react/components/index.mdx`
- `apps/docs/content/docs/en/react/meta.json`
- `apps/docs/content/docs/en/react/releases/v3-0-0-alpha-34.mdx`
- `apps/docs/env.ts`
- `apps/docs/package.json`
- `apps/docs/src/app/[lang]/(home)/components/demo-showcase.tsx`
- `apps/docs/src/app/[lang]/(home)/components/pro-banner.tsx`
- `apps/docs/src/app/[lang]/layout.tsx`
- `apps/docs/src/app/api/changelog/route.ts`
- `apps/docs/src/app/api/newsletter/route.ts`
- `apps/docs/src/app/custom-root-provider.tsx`
- `apps/docs/src/app/global.css`
- `apps/docs/src/components/design-theme-selector.tsx`
- `apps/docs/src/components/fumadocs/ui/theme-toggle.tsx`
- `apps/docs/src/components/highlighted-code.tsx`
- `apps/docs/src/components/home-theme-switch.tsx`
- `apps/docs/src/components/search-dialog.tsx`
- `apps/docs/src/lib/dictionaries/cn.json`
- `apps/docs/src/lib/dictionaries/en.json`
- `apps/docs/src/libs/posthog.ts`
- `apps/docs/src/styles/theme-presets.css`
- `package.json`
- `packages/react/src/components/tabs/tabs.tsx`
- `packages/storybook/.storybook/addons/theme/constants.ts`
- `packages/storybook/.storybook/addons/theme/decorator.tsx`
- `packages/storybook/.storybook/addons/theme/manager.ts`
- `packages/storybook/.storybook/addons/theme/preview.ts`
- `packages/storybook/.storybook/components/docs-container.tsx`
- `packages/storybook/.storybook/globals.css`
- `packages/storybook/.storybook/main.ts`
- `packages/storybook/.storybook/welcome.mdx`
- `packages/storybook/package.json`
- `packages/storybook/styles/globals.css`
- `packages/styles/src/components/tabs/tabs.styles.ts`
- `pnpm-lock.yaml`
- `turbo.json`

## 中断恢复

2026-10-22 已核对远端仍为空仓库。旧临时副本不再存在，本次从原工作区恢复到固定发布目录；独立示例与清单修复从前次操作记录恢复。2026-10-21 的浏览器证据保留原日期，不声称本轮再次运行。恢复后仅补清单单文件检查、静态链接／归档核对和公开下载验证。

## 源码快照的 Git 来源

公开仓库使用固定版本的完整源码快照作为父提交，不复制上游全部历史。组件、样式、文档等原文件保持原字节，上游 CI 文件仅移至 `docs/upstream-workflows/`；官方 commit、tree、本地快照 commit 及 CI 路径映射分别记录在 `upstream.json`。清单工具读取固定快照的文件树，仍报告官方版本身份。原工作区的 Git 历史和未提交内容不变。

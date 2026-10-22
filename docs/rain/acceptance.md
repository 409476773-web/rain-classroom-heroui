# 原版本地化验收记录

日期：2026-10-19。基线：HeroUI `v3.2.6` / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`。

本记录保留版本固定与原版本地化阶段的历史基线。该阶段没有实施雨课堂主题，也没有用户视觉接受记录。后续主题实施与验证见 `theme-acceptance.md`，不要将本页历史状态作为当前进度。

## 已通过

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| 正式标签与完整源码树 | 3,259 个上游受控文件保留，缺失 0；lockfile SHA256 不变 | `upstream.json`、`inventory.json` |
| 固定依赖安装 | `pnpm install --frozen-lockfile` 成功，pnpm 10.26.2 | 本轮终端安装结果及来源记录 |
| styles + React 构建 | 成功，包含类型声明 | `library-build.log` |
| 文档生产构建 | 成功，537 个静态页面完成 | `docs-build.log` |
| Storybook 生产构建 | 成功；658 entries / 586 stories | `storybook-build.log`、`inventory.json` |
| Storybook 源码对账 | 71 个故事源文件、586 个 story exports 与实际 index 对应，缺失/意外项均为 0 | `inventory.json` |
| 类型检查 | React、docs、Storybook 独立检查均成功 | 三个 `*-typecheck.log` |
| 组件 jsdom / Client SSR | 113 文件、624 测试通过 | `tests/README.md` |
| 匹配 Chromium 行为测试 | 12 文件、47 测试通过；Chromium 153.0.8010.12 / revision 1243 | `tests/browser-matching-1243.command.json` |
| 文档测试 | 3 文件、33 测试通过，包括本地模式 6 项 | `docs-tests.log` |
| 清单工具测试 | 8 项通过；生成后 freshness check 通过 | `scripts/rain/inventory.test.mjs`、本轮终端结果 |
| 中英文组件文档响应 | 各 73 页，共 146 页 HTTP 200、含标题，未出现未注册 demo 提示 | `docs-http.json` |
| 打包产物 | 两个 3.2.6 包成功生成，声明的 exports 目标及通配目标存在 | `packed-exports.json` |
| 打包后真实导入 | root + 86 个子路径共 87 个 JS 入口导入成功，Button/Card SSR 成功 | `packed-consumer.json` |
| 本地接口隔离 | 两个订阅端点真实请求返回 503 和本地模式说明 | `local-api-guards.json` |

证据文件的共同目录：`evidence/runtime/heroui-baseline-2026-10-19/`。`tests/` 另有完整命令、退出状态、逐项结果和前后源码摘要。

打包消费检查使用提取后的发布包和当前锁定版本的已安装第三方依赖链接；未冒充另一个新机器上的全新安装。Client SSR 不是 React Server Components 验证。

## 浏览器直接检查

已在应用内浏览器打开原版文档和 Storybook，确认：

- 中文 Button 文档与实际 demo 显示，浅色/深色按钮切换有效。
- 中文搜索输入 Button 后显示组件和相关 API 条目。
- 英文 Select 预览展开选项，选择 California 后触发器显示选中值。
- 中文 Card 文档与预览可以打开。
- Storybook Button 展示各原版变体及 Controls。
- Storybook Modal 打开后展示内容，Esc 关闭并把焦点还给触发按钮。

对应截图：`docs-cn-light.png`、`docs-select-selected.png`、`docs-card.png`、`storybook-button.png`、`storybook-modal-open.png`。这些是抽查证据，不是全库全部状态的视觉认证。

开发模式补验：`pnpm local:preview` 已实际启动两项服务，文档与 Storybook HTTP 200，索引仍为 586 stories。浏览器显示中文 Card 的 7 个预览容器，未挂载 Vercel/PostHog 分析脚本。证据见 `local-preview.log`、`final-local-status.json`。新增本地脚本最终 ESLint 零警告、Prettier 和 `git diff --check` 均通过。

## 保留的上游例外

- 3 处历史 release MDX 引用了当前注册表不存在的 demo：中英文 alpha-34 的 `text-field-basic`、中文 v3-0-4 的 `text-typography-scale`。当前组件页响应检查未出现该问题；未改写历史文档掩盖缺项。
- 4 个中文 TSX 示例文件未直接注册，原文件完整保留。
- Menu 缺少可识别的独立预览覆盖；Dropdown 内部使用 RAC 原语，不能将其 story 当作本库 Menu 的真实覆盖。
- CalendarYearPicker 等上游进行中/辅助模块保留，并按清单标明，不能据此宣称成熟独立组件已验收。
- Google 字体、CDN 媒体、部分公开 API 与外链仍需网络；并非完整离线官网。
- 上游存在路由数量和 jsdom `act(...)` 等警告，本轮构建与测试退出状态均成功。

详细静态例外见 `exceptions.md`。该文件由静态工具生成，运行与打包结果以本记录为准。

## 后续阶段

原版阶段结束时仅将雨课堂输入记录到 `brand-inputs.json`。用户随后授权继续实施主题，映射见 `theme-mapping.md`，结果见 `theme-acceptance.md`。

全量 demo/story 的逐状态交互与视觉审阅、Safari、真实设备、屏幕阅读器、对比度、生产发布及旧业务迁移均未在本轮完成。当前原版技术基线可用于后续主题工作；它不等于这些验收已经关闭。

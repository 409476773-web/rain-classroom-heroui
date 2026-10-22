# 雨课堂主题实施与验证记录

日期：2026-10-19。HeroUI 基线仍为 v3.2.6 / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`；新增私有主题包 0.1.0。

后续全库状态检查与修复另见 [state-audit.md](state-audit.md)。以下保留第一轮接入时的验证记录，不将当时的抽样检查追认成全状态验收。

用户已授权接入雨课堂颜色、字体、圆角，并支持文档站与 Storybook 切换对比。本轮完成这一范围；尚未取得用户对主题外观的最终接受，也未宣布全部组件状态或生产可用性验收。

## 实施结果

- 独立 CSS 包：`packages/rain-theme`，主题值集中一处，原版 React/Styles 受控源码无修改。
- 文档站「主题」菜单增加「HeroUI 原版 / 雨课堂」。雨课堂强制亮色；切回恢复原版预设、明暗模式和样式覆盖。刷新保留选择，存储写入失败时会话内仍可切换。
- Storybook 保留原版亮色/深色，增加「雨课堂 Light」；主题位于 preview iframe 根节点，浮层继承一致。
- 新增 `Components/Theme/Brand Comparison` 中文组合样本：表单、列表/卡片、简化评分面板、Select 浮层与 Modal。内容不连接保存、发布或批改服务。
- 全部原版 stories 保留：原 586 个 + 新增 1 个，共 587 个，构建索引 660 entries，72 个 story 源文件。组件 docs/demo 注册数量不变。

颜色来源与角色取舍、字体回退、圆角的直接变量/inline utility 差别详见 `theme-mapping.md`。

## 自动检查

证据目录：`evidence/runtime/rain-theme-2026-10-19/`。

| 检查 | 本轮结果 | 证据 |
| --- | --- | --- |
| 品牌来源 | 12 份已记录输入全部 SHA256 匹配，旧库未写入 | `source-checks.json` |
| 原版核心源码 | React / Styles 受控文件 diff 为空 | `source-checks.json` |
| 版本固定 | lockfile 仅增加本地主题包链接与空 importer；所有第三方 packages/snapshots 逐字不变 | `source-checks.json`、Git diff |
| 冻结安装 | 成功，跳过解析、没有下载/升级依赖 | `install-frozen.log` |
| Storybook 生产构建 | 成功；styles、React 依赖构建成功 | `storybook-build.log` |
| 文档生产构建 | 成功；537 个静态页完成 | `docs-build.log` |
| 类型检查 | docs、Storybook 单独通过；生产构建跳过类型检查不代替此项 | `docs-typecheck.log`、`storybook-typecheck.log` |
| 文档测试 | 5 文件、50 项通过；包含 provider、真实 next-themes 切换、水合、恢复、独立页面、存储降级和原本地服务隔离 | `docs-tests.log` |
| Storybook 主题测试 | 6 项通过 | `storybook-theme-tests.log` |
| 实际编译 CSS 的 Chromium 回归 | 3 项通过，见下方范围 | `theme-green.log`、`local-tests.log` |
| 清单工具 | 8 项通过；生成后 freshness check 通过；源码 exports 与实际 Storybook 索引一致 | `local-tests.log`、`inventory.log` |
| 变更范围 lint | docs、Storybook 使用各自配置通过；新增主题脚本通过 | `docs-lint.log`、`storybook-lint.log`、`theme-script-lint.log` |
| 选定静态颜色配对 | 主蓝、品牌文字、muted/placeholder、成功、警告、错误与白色的 6 组对比度均 ≥ 5.12:1 | `selected-contrast.json` |

CSS 浏览器回归使用当前 Tailwind 和原版完整样式实际编译：确认仅 import 不影响原版 light/dark；删除品牌标记可准确恢复计算样式；Rain 激活后的品牌色、UI/关键数字字体入口、输入框/卡片圆角有效；抽样组件的高度、padding、gap、字号、行高、字重、字距、阴影、边框宽度、禁用透明度、过渡与变换保持一致。另检查圆形/胶囊保留、body 级浮层继承、原生 Tab 路径。这是样式回归 fixture，不冒充所有 React 组件状态的交互验收。

早期红测、错误工作目录导致的 lint 配置告警、初次尝试锁文件自动解析被取消等调试日志保留。最终成功结果以表中命名日志为准；没有接受第三方版本漂移。

## 浏览器直接检查

使用应用内浏览器检查生产构建：

1. 文档 Card 页面：从原版深色 + Lavender 进入雨课堂，确认页面 `#F2F4FF`、accent `#1561F8`、UI 字体族与 16px 卡片圆角生效。
2. 切回原版，Lavender、深色、字体、背景、文字色、圆角的实际计算值与切换前完全一致。
3. 再选择雨课堂并刷新，根标记、亮色、accent 和页面示例保留。该页面浏览器未记录 error/warn。
4. Storybook 实际菜单可切换原版亮色、雨课堂亮色、原版深色，刷新仍保留 Rain URL global。
5. 雨课堂 Select 选择「示例 B 组」后触发器更新；Modal 打开后显示同主题浮层，Esc 关闭并将焦点还给触发按钮。

证据：`docs-runtime.json`、`docs-rain-card.png`、`storybook-original.png`、`storybook-original-dark.png`、`storybook-rain.png`、`storybook-rain-modal.png`。样式自动回归和实际 UI 抽查分别记账。

随后恢复 `local:preview` 开发服务时，旧 Turbopack 开发缓存仍保存安装新包之前的解析失败。保留原缓存并建立干净 `.next/dev` 后，相同源码和依赖的 Card 路由返回 200，未修改 Next 配置、包导出或依赖版本。证据为 `local-preview.log`（失败）、`local-preview-clean-cache.log`（恢复），当前服务及相关路由结果见 `final-local-status.json`。对照样本最终按仓库约定收于 Components 分组；早期截图中的顶层 Theme 分组仅是导航名称，组件内容不变。最终开发版截图为 `docs-rain-card-final.png` 与 `storybook-rain-final.png`，实际确认文档根标记仍为 Rain、主蓝正确、19 个 Card 示例部件加载；Storybook 显示雨课堂选项和中文组合内容。

## 保留范围

- 雨课堂仅浅色；原版深色保留，没有生成未经确认的雨课堂深色。
- 官方主题编辑器、独立 Showcase 详情保留自身主题；返回组件文档恢复雨课堂。颜色教学中的局部 light/dark 色板、显式自定义样式、图片和外部 iframe 保留原本内容。
- 系统字体和 LINE Seed 仅使用字体栈与回退，没有新增字体二进制。关键数字字体通过显式入口使用，不改变中文单位和所有普通数字。
- 这次静态对比度采样不是完整对比度认证；所有组件族的逐状态视觉/交互审阅、Safari、VoiceOver、真实触控设备及生产验收尚未完成。原版阶段记录的缺项继续保留。
- 未提交、推送或发布，未改写旧雨课堂库，未迁移业务系统。规划中的后续组件中心、完整状态审阅和 AI 工作流规范不因本轮主题接入自动完成。

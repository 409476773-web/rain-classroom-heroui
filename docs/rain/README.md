# HeroUI 本地组件库

已完成版本固定、完整源码本地化与原版运行基线；现已接入雨课堂浅色主题。两处预览都可以切回 HeroUI 原版，保留原版深色。

## P5 最终验收进度

当前是“已有历史基线与重点场景定向验证，P5 整体待最终核验”。2026-10-21 已继续完成 51 个选定 story 的指定路径复查，修复 Storybook 裸文字继承雨课堂正文色，关闭三处历史示例引用，并补齐 r2 的 172 个 ESM 入口导入核对。未运行重测试、全 story 扫描、新依赖安装或生产构建。

- [最终验收总表与后续执行顺序](../plans/2026-10-20-rain-p5-final-acceptance.md)：12 项跨库验收条件、用户确认范围和证据口径。
- [87 模块覆盖矩阵](p5-component-matrix.md)：近期已查范围、早期记录和仍待验证的状态。
- [15 项遗留台账](p5-open-issues.md)：已知缺陷、验证待办与保留设计边界分开记账；I06 已按三处引用范围关闭。
- [扫描工具准备](p5-scan-preflight.md)：显式新目录、默认并发 1、无网络配置预览；仅工具定向检查通过。
- [四组定向复查步骤](p5-next-review-batch.md)：按钮、输入、选择、Table／Tabs 四组；本轮 9 个既有入口的指定路径已执行，未覆盖边界仍待。
- [20 日四组复查报告](p5-focused-review-2026-10-20.md)：377 个默认态采样节点、18 对原版 Light／Dark 恢复的所取样式零差异；19 项为浏览器证据断言，不是组件测试数量。
- [21 日后续复查及下一阶段](p5-followup-review-2026-10-21.md)：表单到媒体的指定范围、当前对比度低值、原版 OTP／Autocomplete 限制及 r2 导入证据。

20 日修复 Rain 宿主字体继承；21 日补齐 Rain body 正文色继承，覆盖裸文字与 portal，Popover 的原版 Light／Dark 所取颜色和字体恢复一致。主题 token、基础组件交互及 r2 交付包未变。20 日 Rain 几何对照只覆盖列明的 14 属性；本次局部结果不关闭全库状态、对比度或平台验证。

当前源码 596 个 stories，历史生产索引为 587；9 项差额已解释但未重新构建。CalendarYearPicker 内部年份面板焦点恢复仍有已知限制；对比度、平台／辅助技术和新环境消费范围不能继承历史结果。

## 打开预览

在项目根目录执行 `pnpm local:preview`，同时启动文档和 Storybook：

- 中文组件目录：<http://127.0.0.1:3100/cn/docs/react/components>
- 雨课堂组件中心：<http://127.0.0.1:3100/cn/docs/react/rain>
- 英文组件目录：<http://127.0.0.1:3100/docs/react/components>
- Storybook：<http://127.0.0.1:6006/>

文档站点击顶部「主题」→「雨课堂」；选择「HeroUI 原版」恢复之前的原版预设和明暗模式。刷新会保留选择。

Storybook 顶部主题菜单可选 **HeroUI Light / HeroUI Dark / 雨课堂 Light**。推荐先看 [中文主题对照样本](http://127.0.0.1:6006/?path=/story/components-theme-brand-comparison--comparison)，集中比较表单、列表、卡片、评分面板与弹窗。主题映射与取舍见 `theme-mapping.md`，本轮运行记录见 `theme-acceptance.md`。

全库状态检查、已修复的软色文案对比度和四处容器圆角遗漏、默认/hover/focus/disabled/invalid 的覆盖边界见 [状态检查记录](state-audit.md)。

最新批注已统一到雨课堂主题：普通列表选中项增加浅品牌底色，空值提示改浅，Button／ToggleButton 圆角为 10px；详见 [视觉反馈调整](visual-feedback-2026-10-19.md)。

2026-10-20 的表格截图反馈在工作区继续调整：衬底采用旧库已有的 `#EBEFFF`（Light `Background/Neutral/4`、`Fill/Neutral/Solid/4`），表头文字仍为 `#7485A8`，仅影响 Rain 表格。第一轮 `#EDF3FA` 作为历史记录保留，见 [表格反馈记录](table-feedback-2026-10-20.md)。用户本次“确定。继续推进”限定确认当前表格配色与普通 Tabs 名称规则，不扩展为全库所有状态或生产验收。

同轮新增用户明确要求的 [标签名称规则](tabs-label-feedback-2026-10-20.md)：Rain 下保持单行、超长省略，悬停截断文字查看原生全名提示。为此本地 Tabs 的两个源码文件增加文字包装与样式语义槽，普通原版样式保留；任意自定义富文本名称不承诺自动截断。

2026-10-20 第一批视觉复查已增加按钮、输入、选项三页集中预览，并补齐搜索／数字输入提示色和固定单位文字映射；入口、实际观察与待验收边界见 [第一批复查记录](visual-review-batch-1-2026-10-20.md)。

第二批补齐独立 Menu 和年份入口，已接回组件中心与 AI 指南。Menu 定向检查正常；年份面板存在原版同样可复现的键盘焦点恢复限制，按约定保持原版行为并保留进行中标记，详见 [第二批复查记录](visual-review-batch-2-2026-10-20.md)。

第三批已复查 Table / Tabs / Card、Modal / Drawer / Toast 和 ErrorMessage 的长中文、窄容器及关键交互，修复复查示例的浮层标题和底部按钮排版；当时尚未修改基础组件与主题 CSS。[第三批记录](visual-review-batch-3-2026-10-20.md) 保留当时范围，后续 Table／Tabs 反馈与用户限定确认另见上述两份记录。

当前私有交付为 [`delivery/rain-heroui-local-2026-10-20-r2/`](../../delivery/rain-heroui-local-2026-10-20-r2/README.md)：React／Styles `3.2.6-rain.1`、雨课堂主题 `0.1.2`，源码上游仍为 HeroUI 3.2.6。已生成三个私有归档并完成限定消费验证，包含两个本地 Tabs 源码补丁与表格新配色：根／子路径导入、Tabs 标签 SSR 与 `tabLabel` 槽、Bundler 示例／负例类型及包内 CSS 编译通过，解包主题 CSS 与当前冻结源码 SHA 一致。实际范围见[消费验证记录](consumer-verification.md)与 r2 的 `report.json`。旧 [0.1.1 交付](../../delivery/rain-heroui-local-2026-10-20/README.md) 及其 6007 独立组合预览保留为此前冻结快照，不包含这些更新。

[雨课堂组件中心](http://127.0.0.1:3100/cn/docs/react/rain) 已接入中英文搜索、分类、文档／Storybook 跳转、本地源码定位与 AI 上下文复制。[本批说明](component-center.md) 记录生成目录和 AI 规则；r2 已完成本轮限定的[独立引用检查](consumer-verification.md)，仅代表报告中的消费路径，不替代全库所有状态、跨设备或生产验收。

新增 [批改面板业务组合](http://127.0.0.1:3100/cn/docs/react/examples/grading-panel)，将学生列表、作答卡片、评分表单与确认浮层串成可操作的流程。[Storybook 入口](http://127.0.0.1:6006/?path=/story/components-business-grading-panel--workspace&globals=heroui-theme:rain-light) 共用同一份源码，支持原版／雨课堂主题对照。文件位置、交互边界和本轮轻量检查见 [示例说明](grading-example.md)。本次遵照要求没有重跑全库测试或生产构建；之前的构建结果不包含新增业务 story。

这个入口强制启用本地预览模式、保留所有 stories，只监听本机。端口占用时直接报错，不会终止其他程序或自动换端口。按 Ctrl+C 同时停止它启动的两个服务。首次访问文档需要编译，较生产预览慢。

需要其他端口时，设置 `RAIN_DOCS_PORT` 和 `RAIN_STORYBOOK_PORT`。文档中的上游 Storybook 链接默认仍使用 6006，换端口后请使用启动器输出的地址。

启动器只在 `apps/docs/.env.local` 不存在时复制公开配置示例；不覆盖现有文件，不需要私钥。公开字体、图片和部分异步示例仍需要网络。

## 版本与文件位置

- 官方仓库：<https://github.com/heroui-inc/heroui>
- 固定正式标签：`v3.2.6`
- 固定提交：`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`
- 当前私有交付：React／Styles `3.2.6-rain.1`、主题 `0.1.2`；不改变上述官方基线，不代表官方新 release。
- 分支：`codex/heroui-localization`
- 完整来源与 lockfile 摘要：`docs/rain/upstream.json`
- 上游 3,259 个受版本控制文件全部保留；使用浅克隆获取该版本，未下载此前全部 Git 历史。

| 位置                                        | 用途                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `packages/react`                            | 组件实现、stories、测试；按需修改基础组件的入口                      |
| `packages/styles`                           | CSS、原版主题、变体                                                  |
| `packages/rain-theme`                       | 唯一雨课堂主题入口；颜色、字体族、圆角及用户明确要求的 Tabs 名称规则 |
| `apps/docs/content/docs`                    | 上游中英文文档                                                       |
| `apps/docs/src/demos`                       | 上游示例与注册表、源码展示                                           |
| `apps/docs/src/components/rain-examples`    | 雨课堂业务组合；文档和 Storybook 共用                                |
| `packages/storybook`                        | 官方 Storybook 配置与总览                                            |
| `packages/standard`、`packages/testing`     | 工程与测试依赖                                                       |
| `docs/rain/inventory.json`                  | 可重新生成的源码、导出、示例交叉清单                                 |
| `docs/rain/exceptions.md`                   | 上游缺项与静态覆盖边界                                               |
| `docs/rain/brand-inputs.json`               | 后续换肤使用的旧库品牌文件来源和内容摘要                             |
| `docs/rain/acceptance.md`                   | 本轮验证结果和明确未验收范围                                         |
| `docs/rain/ai/index.md`、`usage-rules.md`   | AI 读取入口、复用和改造规则                                          |
| `docs/rain/ai/components.md`                | 自动生成的同版本组件定位表                                           |
| `apps/docs/src/generated/rain-catalog.json` | 组件中心与 AI 共用的精简目录                                         |

本地预览直接使用 workspace 中的源码。没有另复制一套组件，也没有为全部组件增加空包装。完整源码属于这个固定的 React 开源版本；不包含 Pro 付费资产或 React Native 实现。

## 重新安装和验证

上游 `.nvmrc` 指定 Node 22.14.0；包声明支持 Node >=22。此次实际环境为 Node 24.13.0、项目固定 pnpm 10.26.2。主题阶段仅为新本地 CSS 包增加 workspace 链接；所有第三方解析记录和版本不变。日常安装使用冻结 lockfile。

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm local:preview
```

常用检查：

```sh
pnpm local:inventory
pnpm local:inventory:check
pnpm local:catalog
pnpm local:catalog:check
pnpm build:docs
pnpm build:storybook
pnpm typecheck
pnpm --filter @heroui/react test:jsdom
pnpm --filter @heroui/react test:browser
pnpm --filter @heroui/docs test
node --test scripts/rain/inventory.test.mjs
node --test scripts/rain/theme.test.mjs
pnpm exec vitest run --config packages/storybook/vite.config.ts packages/storybook/.storybook/addons/theme/preview-theme.test.ts --environment node
```

新机器的浏览器测试需安装与 lockfile 匹配的 Chromium：`pnpm --filter @heroui/testing exec playwright install chromium`。此次安装器网络超时后使用同一官方下载文件完成安装，校验与过程见测试证据，不涉及替换依赖版本。

官方文档生产构建默认跳过类型错误，因此必须另跑 `pnpm typecheck:docs`；本轮已单独通过。原版 `start:storybook` 使用上游遗留命令，本地日常预览使用已验证的 `local:preview`，不依赖它。

原版文档预生成脚本会改写 `theme-presets.css` 的缩进和数字格式；本轮确认运行 Prettier 后与上游内容一致，不是雨课堂主题改动。Next 开发服务器还会生成 `apps/docs/AGENTS.md` 与 `CLAUDE.md`，已保留其说明。

不要运行上游 `clean:cache` 来清理普通预览问题：该脚本也会删除 lockfile。不要把在线官网移动分支或在线 MCP 的最新内容当作本地固定版本的 API 依据。

如果新建 workspace 包时开发服务已在运行，安装后仍提示无法解析主题包，但生产构建正常：先关闭本项目预览，再将 `apps/docs/.next/dev` 改名备份并重新启动。本次已用相同源码/依赖验证此方法；无需改包版本或删除 lockfile。旧开发缓存保存在 `.next/dev-before-rain-theme`，属于忽略的运行产物。

## 本轮结果

原版本地化阶段：组件现有测试 671 项、文档测试 33 项、清单工具测试 8 项通过；中英文共 146 个组件文档路由响应正常。详情保留在 `acceptance.md`。

主题接入阶段的历史结果：文档/Storybook 生产构建与类型检查通过；该阶段文档测试为 50 项，Storybook 主题切换 6 项，实际编译 CSS 的浏览器回归 3 项通过。原有 586 个 stories 均保留，当时新增 1 个对照样本，共 587 个；当时清单与构建索引一致。后续源码现为 596 个 stories，历史生产索引仍为 587；新增内容只做必要定向检查，未重新生产构建。

“静态清单完整”“生产构建通过”“浏览器抽查通过”分别记账；不等于每个 demo 的每种状态都已人工验收。详细结果、上游例外和下一阶段边界见 `acceptance.md`。

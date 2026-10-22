# P5 遗留事项台账

日期：2026-10-21。首轮为既有资料整理，随后完成 I07 静态分类及 I13 扫描工具准备和单文件检查；上述准备阶段没有浏览器操作。20 日四组复查覆盖 9 个指定 story 并修复 Rain 宿主字体；21 日继续覆盖 51 个去重选定 story 的指定路径、修复 Storybook Rain body 正文色继承及三处历史 release 引用。仍未启动重测试、全 story 扫描或生产构建，主题颜色、基础组件与 r2 冻结交付保持不变。

当前源码基线为 HeroUI 3.2.6 / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`。最新私有交付为 [r2](../../delivery/rain-heroui-local-2026-10-20-r2/README.md)：React／Styles `3.2.6-rain.1`、Rain Theme `0.1.2`，包含获授权的 Tabs 本地补丁。旧版本的成功记录保留其发生时点，不自动成为当前版本的成功记录。

本台账区分真实已知缺陷、待验证工作和保留的设计／范围限制。没有证据指向 P0 或生产事故，不将本地预览限制写成生产事故。用户已确认的页面与颜色范围见 [批改页](grading-example.md)、[第一批](visual-review-batch-1-2026-10-20.md)、[第二批](visual-review-batch-2-2026-10-20.md)、[Table](table-feedback-2026-10-20.md) 与 [Tabs](tabs-label-feedback-2026-10-20.md)；这些确认不关闭全库、平台、辅助技术或生产验证。

## 声明边界

| ID     | 类型                                | 对验收声明的影响                                                                     |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------------ |
| P5-I01 | 真实已知缺陷：年份面板焦点恢复      | 阻止无保留的 P5 全部交互／键盘通过声明；直接限制 CalendarYearPicker 及其父级年份入口 |
| P5-I02 | 待验证：当前生产构建与索引          | 阻止 P5 当前产物全部同步、当前生产构建通过声明                                       |
| P5-I03 | 待验证：最新全库状态回归            | 阻止 P5 全库逐状态通过声明                                                           |
| P5-I04 | 待验证＋保留的对比度限制            | 阻止 P5 全状态对比度／完整无障碍通过声明                                             |
| P5-I05 | 待验证：平台、辅助技术、真实触控    | 阻止跨平台／辅助技术完整验收声明；不能扩大本机检查范围                               |
| P5-I06 | 已限定关闭：3 处历史 release 引用   | 三页共 19 个预览无 missing 提示；只关闭这三处引用，不扩大为全文档通过                |
| P5-I07 | 已静态分类：4个中文文件保留未注册   | 现有文档有对应或相关样本；不承诺这4文件独立运行，也不为清零数字强行注册              |
| P5-I08 | 保留结构＋映射待核验边界            | 限制“每个模块都有独立文档／独立故事”的声明，不要求为每个子部件造文档                 |
| P5-I09 | 部分定向通过：r2 全 JS 入口导入     | 172／172 ESM 导入成功；干净安装与全部行为仍待，不能作无保留生产接入声明              |
| P5-I10 | 历史已知兼容限制：NodeNext 声明     | 仅限制 NodeNext 支持声明；现有 Bundler 结果按原范围有效                              |
| P5-I11 | 保留范围：网络字体与外部资源        | 仅限制完整离线、资源自包含及所有外部内容可用的声明                                   |
| P5-I12 | 已确认的 Tabs 设计边界              | 仅限制任意富文本自动截断、键盘／触屏原生 title 提示的声明                            |
| P5-I13 | 工具准备定向通过：真实扫描未执行    | 新目录、可控并发和配置预览已接入；不关闭当前全库回归或生产验证                       |
| P5-I14 | 真实示例限制：OTP 错误文字残留      | 编辑撤销槽位错误标记后文案仍显示，原版同现；不记错误反馈完整恢复                     |
| P5-I15 | 已知上游同现：Autocomplete 关闭焦点 | 指针打开后在搜索框 Esc，浮层关闭而焦点落 body；不记该路径焦点返回通过                |

“阻止声明”不表示已验证的本地预览或有限消费路径不可用。P5 整体只能在对应范围补齐证据后关闭；若保留例外，应继续明确例外，不能将其改记为通过。后续执行需有明确的工作安排，继续遵守暂缓重测试、全 story 扫描和生产构建的约束；本台账不隐含提交、推送、发布或其他项目迁移授权。

## P5-I01 — CalendarYearPicker 年份面板关闭后的焦点

- **类型／状态：** 真实已知缺陷，未修复；原版与 Rain 均复现，上游仍标为进行中。
- **影响与有限证据：** Calendar 选年后，年份面板关闭，但焦点仍位于隐藏且移出 Tab 顺序的年份按钮；RangeCalendar 按 Esc 关闭年份列表也有同类结果。[第二批记录](visual-review-batch-2-2026-10-20.md)及 `evidence/runtime/rain-visual-batch-2-2026-10-20/calendar-original-after-choose.json`、`calendar-rain-after-choose.json`、`range-year-interactions.json` 直接记录该状态。整个 DatePicker 浮层关闭后恢复触发器焦点的成功，不能替代内部年份面板的结果。
- **下一步：** 继续在组件中心、AI 上下文和验收清单保留限制。如安排修复，先明确是否授权改变该上游交互，再确定关闭年份面板后应返回的焦点目标；不使用 story 局部事件掩盖缺陷。
- **关闭条件：** 在获授权的实现中，Calendar／RangeCalendar 的选年及 Esc 路径均将焦点恢复到可见、可操作的合理目标，并有针对原版／Rain 的键盘证据。仅保留范围说明不等于缺陷修复，也不能计为完整键盘通过。

## P5-I02 — 当前生产构建与 Storybook 索引的 9 项差额

- **类型／状态：** 待验证工作，尚未运行当前生产构建。
- **影响与有限证据：** 当前静态源码为 596 个 story exports；历史生产索引为 587 stories／660 entries，差额 9 项是批改页及 8 个分批复查样本。[例外清单](exceptions.md)记录 `missing_built_story`，三批文档记录各阶段增长。开发索引可达和实际预览成功不证明生产产物已经包含这些故事；历史文档构建的 537 页也不是当前构建结论。
- **下一步：** 在明确安排允许生产构建后，按当前冻结源码重建文档／Storybook，刷新清单并对账真实索引；保留历史产物，不为消除差额篡改历史索引。
- **关闭条件：** 当前构建有成功退出记录，生成清单与实际索引对齐，新增入口可达，版本／源码指纹能对应当次产物。仅重新生成静态清单不能关闭本项。

## P5-I03 — 最新全库状态回归尚未执行

- **类型／状态：** 待验证工作；已有历史基线和后续定向结果。
- **影响与有限证据：** [19 日状态审计](state-audit.md)的 `final-react-interactions.log` 为 13 文件／51 项，`final-css-tests.log` 为 19 项，`story-smoke.json` 为 587/587 初始渲染。它们早于按钮 10px、浅 placeholder、ListBox 选中底色及 Table／Tabs 后续变化。三批复查、Tabs 10/10 和 r2 消费检查只覆盖各自记录的路径，不能合并称为当前全库全部状态通过。
- **覆盖解释：** `packages/storybook/.storybook/rain-states.browser.test.tsx` 实际包含两个输入变体、Checkbox、ListBox＋Card 四项专项。测试源码存在不等于本轮已运行。历史 51 项还包含 ScrollShadow、Tag 等检查；其中 Autocomplete browser 用例检查 Tag 删除，不能由历史审计的概括文字推断其键盘导航已覆盖。
- **本轮定向进展：** [按钮、输入、选择与 Table／Tabs 复查](p5-focused-review-2026-10-20.md)已完成四组清单的 9 个指定 story 路径，包括真实输入／清空、步长与界限、选择与禁用、浮层焦点返回、两变体排序、Table 窄区域及 Tabs 名称／键盘，并补看指定文档节点。[最终稳定对照](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/style-comparison-final.json)记录 377 个默认态采样节点、18 对原版 Light／Dark 恢复，所取样式零差异；Rain 几何仅比较列明的 14 属性，唯一差异为已获授权的 Tabs label 从两行 40px 变为单行 20px。[19 项断言](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/focused-checks.json)核对已有浏览器证据，不是 19 个组件测试；[9 个入口](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/entry-health.json)的可见 Storybook 错误面板为 0。字体修复只作用于 Storybook Rain `#storybook-root`，原版恢复已实际验证；没有追加父容器颜色覆盖。本项继续开放，不将指定节点或路径扩展为全库状态通过。
- **2026-10-21 后续定向进展：** [N 记录](p5-followup-review-2026-10-21.md)及[入口清单](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/browser-entries.json)覆盖 51 个去重选定 story 的指定路径，补充选择控件、过滤／输入 OTP、独立浮层、日期分段、Slider、导航、颜色组合、反馈与媒体。唯一新增实现修复为 Storybook Rain body 正文色继承：Popover 可见 dialog／heading／p 从黑色恢复为 `#14233C`；三个节点在原版 Light／Dark 的 color／font 修复前后恢复。不是全库扫描或全状态对照；瞬时关闭快照可能包含退出动画文本，以 aria-expanded 与等待 hidden 的后续记录判定。OTP 文案残留 I14、Autocomplete 指针打开后 Esc 焦点限制 I15 及其他未走路径继续开放。
- **下一步：** 明确安排后，以当前源码及归档为对象，确定适用状态和真实操作路径，再执行必要回归；区分源码审查、CSS 状态夹具、React 交互和人工视觉记录。
- **关闭条件：** 当前版本的适用状态矩阵有可追溯结果，失败已处理或作为明确例外保留；不能用初始渲染、静态文件数量或旧版绿灯替代逐状态证据。

## P5-I04 — 当前提示色、表头及 Tabs hover 的对比度

- **类型／状态：** 部分当前样本已计算，保留提示色、表头与 Tabs hover 对比度限制；其他状态仍待验证，不统称换肤 bug。
- **影响与有限证据：** 早期 placeholder `#56688F` 的对比度结果不适用于当前已确认的 `#A0ACC5`。最新 Table 为 `#EBEFFF` 背景／`#7485A8` 表头文字，既有反馈验证检查了颜色和几何，没有完成所有交互与透明叠加的对比度审阅。历史 32 组 soft 状态色通过仅覆盖其采样表面与状态。
- **2026-10-21 当前取样：** [DOM 与计算结果](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/contrast-calculation.json)仅检查 21 个非禁用样本：15 个 placeholder、6 个表头。`#A0ACC5` 在白底为 **2.282:1**，在 secondary `#EDF3FA` 为 **2.043:1**；表头 `#7485A8` 在 `#EBEFFF` 为 **3.236:1**，均低于所采用普通文字 AA **4.5:1**。本轮保持用户已确认颜色，不能宣称这些样本对比度通过；不是全量透明合成或完整无障碍审计。
- **已知边界：** `collections-source-audit.md` 记录 Tabs 未选中项 hover 使用整体 `opacity: .7`，原版和 Rain 的所测文字合成比值均不足 4.5:1；本项目保留此上游机制。第三批布局页自动面板为 0 violations、34 passes、1 inconclusive，最后一项为 Tabs 背景重叠导致无法判断，且发生于后续 Tabs 补丁前。它不是完整对比度或辅助技术认证。
- **下一步：** 明确安排后检查当前实际背景、hover／focus／selected、透明合成及适用文字角色。若需要改变用户确认的颜色或上游 opacity 机制，先明确新的设计授权，不能以审计为名自动改色。
- **关闭条件：** 当前范围内的对比度结果及适用标准明确，低值项已获授权修复并复核，或保留为不能宣称通过的设计例外。用户视觉确认本身不关闭对比度项。
- **证据：** [第一批边界](visual-review-batch-1-2026-10-20.md)、[Table 反馈](table-feedback-2026-10-20.md)、[第三批](visual-review-batch-3-2026-10-20.md)；`evidence/runtime/rain-theme-state-audit-2026-10-19/collections-source-audit.md`、`forms-source-audit.md` 与 `evidence/runtime/rain-visual-batch-3-2026-10-20/layouts-a11y-after.txt`。

## P5-I05 — 平台、辅助技术与真实触控

- **类型／状态：** 待验证工作，不是已发现的跨平台故障。
- **影响与有限证据：** 现有运行证据以本机 Chromium／应用内浏览器为主；320px 容器或桌面窄视口检查不能等同真实手机。Safari／Firefox、VoiceOver 等读屏、真实触控、全部缩放／RTL／响应式组合仍未完成。一次按钮组 RTL 导航不能扩展为全库 RTL 通过。
- **下一步：** 根据目标使用环境明确平台和辅助技术矩阵，再安排日期分段、菜单／列表、浮层焦点、Drawer 手势、长中文与缩放等实际路径。
- **关闭条件：** 对声明支持的平台记录版本、设备／输入方式、操作路径、结果和例外；完成目标矩阵才可扩大支持声明。DOM 可访问名称或自动扫描结果不替代读屏操作。
- **证据：** [主题接入边界](theme-acceptance.md)、[状态审计](state-audit.md)及三批复查文档的保留范围。

## P5-I06 — 3 处历史 release MDX 的 demo 引用缺项

- **类型／状态：** 已限定关闭，2026-10-21 完成三处引用修正与对应页面验证。
- **原始问题：** 英文及中文 `v3-0-0-alpha-34.mdx` 引用未注册的 `text-field-basic`；中文 `v3-0-4.mdx` 引用未注册的 `text-typography-scale`。
- **当前处置：** 两处 TextField 引用改为当前注册的 `textfield-basic`；Typography 引用改为 `typography-typography-scale`。保留发布说明及有效示例，没有以删除历史检查来掩盖缺项。
- **限定证据：** [中文 alpha.34](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/release-cn-alpha34.json)与[英文 alpha.34](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/release-en-alpha34.json)各 9 个预览，[中文 v3.0.4](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/release-cn-v304.json)为 1 个预览，合计 **19 个预览**，三份 `missing` 均为空。
- **关闭边界：** 只关闭明确列出的三处引用缺项，不据此宣称全部文档、示例、生产构建或组件状态通过。静态清单的后续摘要刷新由独立记录处理。

## P5-I07 — 4 个中文 TSX 文件未直接注册

- **类型／状态：** 静态分类已完成，源码保留未注册；没有新增运行验证。未直接注册不自动等于遗漏或 bug。
- **影响与有限证据：** [例外清单](exceptions.md)保留四个文件：`apps/docs/src/demos/cn/close-button/variants.tsx`、`apps/docs/src/demos/cn/link/underline-offset.tsx`、`apps/docs/src/demos/cn/link/underline-variants.tsx`、`apps/docs/src/demos/cn/skeleton/card.tsx`。它们可能是辅助文件、历史示例或漏注册项，需要逐项判定。
- **排除项：** 中英文 DatePicker／DateRangePicker 的四个 `format-options-no-ssr.tsx` loader 到 `format-options.tsx` 的映射已有动态导入证据，是合法包装器，不属于本项，也不能混计成八个缺失示例。
- **2026-10-20 分类结果：** 已读取这4份源码、当前中文注册表和对应组件文档。它们是未接入的展示源文件，不是那4个合法loader包装器；没有把它们标成已运行。

| 未直接注册文件                | 当前内容／分类                           | 已注册且文档引用的样本                                      | 处置                                                         |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| `close-button/variants.tsx`   | 只展示默认CloseButton；额外展示排版      | `close-button-default`                                      | 保留源码；默认用法已有入口，不新增同义注册                   |
| `link/underline-offset.tsx`   | offset 1／2／3 的拆分样本                | `link-underline-and-offset` 包含这些用法                    | 保留源码；继续使用合并示例                                   |
| `link/underline-variants.tsx` | 默认／underline／no-underline 的拆分样本 | `link-underline-and-offset` 包含这些用法                    | 保留源码；继续使用合并示例                                   |
| `skeleton/card.tsx`           | 额外卡片骨架组合                         | `skeleton-custom-styles` 是相关卡片组合，未声称两者完全相同 | 保留未接入源文件；若今后采用，单独验证其布局与工具类后再注册 |

- **下一步：** 当前分类待办已完成，不为清零未注册数量而添加重复或未验证入口。四文件仍记在生成清单；若业务需要额外采用，再补相应注册、引用和运行验证。
- **关闭条件：** 静态分类与处置已记录在 `evidence/reviews/rain-p5-preflight-2026-10-20/unregistered-demo-disposition.json`，含原文件摘要与对应文档。该分类不关闭组件状态验收，也不将保留源文件的运行状态改成通过。

## P5-I08 — 无独立文档及父级／组合预览的映射边界

- **类型／状态：** 保留的组件结构与待核验映射边界，不作为普遍实现缺陷。
- **影响与有限证据：** 87 个源码模块包括公开组件、子部件、辅助模块和进行中模块；数量不等于 87 个独立成熟组件。`referenced-by-parent-or-composition-story` 与 `parent-implementation-linked-to-story` 只表示实际源码引用关系，不证明所有状态已验收。Menu、年份入口和 ErrorMessage 已在后续复查补上真实预览，原版验收文档中“Menu 缺少可识别预览”仅为历史状态。
- **计数口径：** [inventory.json](inventory.json) 中有自有文档的模块为 72，无自有文档的模块为 15；每语言 73 个组件文档文件是文件数，不能用 `87 - 73` 推算缺文档模块。15 项为 calendar-year-picker、color-input-group、date-input-group、empty-state、header、icons、list-box-item、list-box-section、menu、menu-item、menu-section、rac、radio、switch-group、tag。
- **下一步：** 在模块矩阵中保留自有文档／父文档、独立故事／父级组合故事、helper／in-progress 身份，核对链接和实际组件引用。不要为每个 part 人为制造文档，也不要将 Dropdown 内的 RAC Menu 当成本库公开 Menu 的覆盖。
- **关闭条件：** 每个条目的资料类型、真实引用、预览定位和使用限制均明确；适合父级覆盖的模块可以保留父级映射。静态映射准确只关闭映射核对，不关闭该模块的运行或状态验收。
- **证据：** [例外清单](exceptions.md)、[组件中心](component-center.md)、[第二批](visual-review-batch-2-2026-10-20.md)、[第三批](visual-review-batch-3-2026-10-20.md)。

## P5-I09 — 全新依赖安装及 r2 全入口消费覆盖

- **类型／状态：** 部分定向通过：r2 全部声明的 JavaScript ESM 入口实际导入；全新依赖安装和全部行为仍待验证。
- **影响与有限证据：** [r2 report](../../delivery/rain-heroui-local-2026-10-20-r2/report.json)确认 React 264、Styles 11、Theme 1 个具体导出目标存在，以及根包／所测子路径、表单卡片 SSR、Tabs 补丁、Bundler 类型和包内 CSS 编译。实际 6008 页面来自解包库，但第三方依赖复用本机安装。目标存在不等于逐入口真实导入和行为通过；原版阶段 root＋86 子路径的导入结果不能直接记到 r2。
- **2026-10-21 增量：** [真实导入报告](../../evidence/reviews/rain-p5-r2-imports-2026-10-21/results.json)记录 **172／172 ESM 导入成功**：React **87**、Styles **85**，Theme 为 CSS 不计 JavaScript 导入。三个解包包共 **1,203 个文件**与 r2 归档逐字节一致，冻结交付 **23 个文件**未变。原报告的 264／11／1 是导出目标存在数量，不能改写为本轮实际导入数量。第三方依赖仍复用本机安装；CSS、类型、元数据与 wildcard CSS 模式不计入 JavaScript 导入，无 require 条件而未验证 CJS。导入成功只证明解析和模块求值，不证明渲染、全部行为、RSC 或生产接入。
- **下一步：** 明确安排后，在独立新环境按归档及准确依赖声明安装，检查 peerDependencies、示例直接依赖，复用已完成的 172 个 ESM 入口结果，并在新环境核对所需消费方式；行为覆盖另按 P5-I03 记账。
- **关闭条件：** 新环境安装有清晰环境／版本／来源记录，r2 全入口检查明确实际执行清单并通过或列出例外。不得用本机依赖链接、导出文件存在数量或旧包报告替代。
- **证据：** [消费验证](consumer-verification.md)、[原版历史基线](acceptance.md)、`evidence/runtime/rain-delivery-r2-2026-10-20/browser-checks.json`。本项不授权安装到其他业务工程或迁移项目。

## P5-I10 — 历史 NodeNext 声明解析限制

- **类型／状态：** 历史已知兼容限制，当前未重跑或解决。
- **影响与有限证据：** [消费验证](consumer-verification.md)记录 NodeNext 探针因上游声明 barrel 的无扩展名导出未通过。r2 的正／负类型检查针对 `moduleResolution: "Bundler"`，不能宣称 NodeNext 声明兼容；该限制不否定已通过的 Bundler 使用范围。
- **下一步：** 先明确目标消费者是否需要 NodeNext。若需要，再安排对应声明输出策略与隔离消费验证；若不需要，持续明确 Bundler 支持边界即可，不为本地前端场景扩大改造。
- **关闭条件：** 需要 NodeNext 支持时，必须有配套声明与实际 NodeNext 消费成功证据；仅明确“不在支持范围”可关闭适用性决策，但不能将兼容性记为通过。

## P5-I11 — 网络字体、媒体及外部资源不属于完整离线交付

- **类型／状态：** 保留的范围限制；外部内容可用性未获全量保证。
- **影响与有限证据：** [原版验收](acceptance.md)保留 Google 字体、CDN 媒体、部分公开 API 与外链仍需网络的边界。Rain 主题只声明系统字体及 LINE Seed 等回退栈，未新增字体二进制；本机计算字体栈正确不证明所有平台实际使用同一字形。外部图片／iframe／颜色教学内容也不强制换肤。历史初始渲染检查明确未覆盖全部外部媒体。
- **下一步：** 若要承诺离线使用，先明确离线范围、资源清单及可再分发权限，再安排资源本地化／降级和断网检查；否则在交付入口继续说明网络及字体回退条件。
- **关闭条件：** 只有在约定离线范围内的资源、字体和交互均有断网证据，才能作相应离线声明。保留网络依赖说明可关闭范围沟通，不代表完整离线验证通过。

## P5-I12 — Tabs 富文本与原生 title 的键盘边界

- **类型／状态：** 用户已确认的设计／范围限制，不是新增缺陷。
- **影响与有限证据：** [Tabs 反馈记录](tabs-label-feedback-2026-10-20.md)及 r2 浏览器证据覆盖普通名称、连续字符串／数字／纯文本 Fragment 的单行省略；实际溢出时悬停文字设置原生 title，离开清除，禁用项可看全名且不能选择。任意自定义富文本元素不递归改写；键盘聚焦不会弹原生 title，触屏提示也未承诺。完整 DOM 可访问名称保留，不等于已经完成读屏使用验证。
- **下一步：** 调用方按公开组合边界处理富文本标签；如业务需要键盘／触屏可见的全名提示，先明确新的交互要求，再评估原语组合，而不是将当前原生 title 误写成所有输入方式都可见。
- **关闭条件：** 当前普通名称方案的验收可保持限定通过；只有明确扩展范围并有相应实现和定向证据，才可扩大富文本或键盘／触屏提示承诺。用户“确定。继续推进”不包含这些扩展。

## P5-I13 — 重跑前的证据目录与并发准备

- **类型／状态：** 工具准备已实现并完成定向检查，不是组件缺陷；真实扫描未执行。
- **原始问题（历史）：** 旧 `scripts/rain/story-smoke.mjs` 固定写入 19 日证据目录、固定 3 并发，直接复用旧命令可能覆盖历史报告。
- **当前处置：** 必须显式指定新目录，已有目录／文件／软链接均拒绝；默认并发 1，可选择 1–3。新增 help／plan 无网络预览，以及真实运行的独占写入、来源／索引摘要和失败状态记录。空索引不能以 `0/0` 通过。来源摘要仅含列明文件和 inventory 既有声明，不等于新候选全量冻结；详见[工具准备说明](p5-scan-preflight.md)。
- **定向证据：** `evidence/reviews/rain-p5-preflight-2026-10-20/` 的工具测试为 6 个子检查、含父测试共 7 项通过；实际 CLI help／plan 成功，历史目录被拒绝，候选输出目录未创建。语法、lint、格式检查通过。旧报告保持原样；这些检查没有启动组件或浏览器测试。
- **后续条件：** 工具准备待办已完成；真实网络／浏览器／工作池整合仍未运行。全 story 扫描继续暂缓，未来明确安排后另建证据目录并记录完整候选身份；I02／I03 不因本项准备完成而关闭。

## P5-I14 — InputOTP 上游校验示例的错误文字残留

- **类型／状态：** 真实示例限制，未修复；原版 Light 同现，不是 Rain 换肤回归。
- **影响与有限证据：** `components-forms-inputotp--with-validation` 输入错误的 6 位码并提交后，6 个 Slot 的 `data-invalid=true`。随后编辑／删除，6 个槽位错误标记全部撤销，错误 span 的 `data-visible` 从 `true` 变为 `false`，但文字 **Invalid code. Please try again.** 仍以 `opacity: 1` 显示。不能写成错误文案已清除或反馈回路完整恢复；外层 wrapper 没有 `data-invalid`，不以其属性推断内部状态。
- **证据：** [错误槽位标记](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/otp-error-flags.json)、[编辑后标记](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/otp-corrected-flags.json)、[原版 Light 同现](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/otp-original-light-same-fixture-limit.json)，以及[详细显示记录](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/otp-edited-details.json)。`otp-edited-clears-error.json` 的文件名描述原检查意图，不能作为文字已消失的结论。
- **下一步／关闭条件：** 在独立安排的上游示例修复范围内核对显示条件及错误关联，补齐错误提交→编辑撤销→文案真实隐藏的定向证据后才可关闭。本轮保留基础组件与原版交互，未用 Rain 样式掩盖文案。

## P5-I15 — Autocomplete 指针打开后 Esc 的焦点限制

- **类型／状态：** 已知上游同现限制，未修复；不记成 Rain 专属回归，也不记焦点返回通过。
- **实际路径：** `components-pickers-autocomplete--with-disabled-options` 用指针点开 trigger，在自动聚焦的搜索框按 Esc，并等待 popover hidden。内部按钮 `aria-expanded=false`，浮层已关闭，但 `activeElement` 落在 **body**。
- **有限证据：** [原版 Light](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/autocomplete-original-light-escape-settled.json)、[原版 Dark](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/autocomplete-original-dark-escape-settled.json)与[Rain](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/autocomplete-rain-escape-final.json)均记录此结果。早期关闭快照含退出动画内容，不以其 text 判定关闭失败。
- **边界与后续：** 只覆盖“指针打开→搜索框 Esc→等待隐藏”，不扩展为键盘打开、多选或其他关闭方式的结果。若安排改动，先明确上游焦点策略与受影响路径，再定向修复及核验；保留关闭成功与焦点恢复限制两个不同结论。

## 后续记账

每次处理条目，应追加对应源码／交付版本、实际执行范围、证据路径及仍保留的例外。有限通过、用户视觉确认、完整验收、发布和迁移分别记账；不通过修改本台账文字把未执行工作视为已执行。

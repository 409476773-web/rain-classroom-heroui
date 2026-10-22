# HeroUI 全库本地化与雨课堂主题 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将固定正式版本的 HeroUI React 开源库、样式、文档和示例完整保存在本地，并以原有组件行为和视觉结构为基础，提供可运行、可修改、可供 AI 检索的雨课堂主题组件库。

**Architecture:** 保留 HeroUI 官方 monorepo 及其源码依赖关系。复用官方文档站和 Storybook，增加独立雨课堂主题包、轻量导航入口和版本匹配的 AI 索引；不另建一套全库组件或示例渲染器。

**Tech Stack:** HeroUI React v3、React 19、Tailwind CSS 4、TypeScript、pnpm workspace、官方 Next.js 文档站、Storybook；具体版本跟随冻结的官方提交和 lockfile。

---

> 执行更新（2026-10-19）：版本固定与原版本地化已执行，详见 `docs/rain/acceptance.md`。用户随后授权实施雨课堂主题与两处切换对照，结果见 `docs/rain/theme-acceptance.md`。下方“尚未实现”等描述保留为规划形成时的历史状态，不能用作当前进度；其他规划任务不因本轮主题接入自动视为完成。

> 执行更新（2026-10-20）：已审核的课堂练习批改业务页保留为样本；新增 P3 组件中心、生成目录与双向入口，补充 P4 AI 索引、使用规则和限定的独立包消费检查，见 `docs/rain/component-center.md`、`docs/rain/consumer-verification.md`。P5 新一轮重测试与生产构建继续暂缓；全新联网安装、NodeNext 声明解析及全库生产验收未标记通过。

> 第三批更新（2026-10-20）：剩余重点 Table / Tabs / Card、Modal / Drawer / Toast 与 ErrorMessage 已完成限定复查，新增集中预览并修正示例窄屏排版；ErrorMessage 接回组件中心和 AI 上下文。当前交付同步为 HeroUI 3.2.6 / 雨课堂主题 0.1.1，附实际归档、校验清单和已定向操作的独立示例，见 `docs/rain/visual-review-batch-3-2026-10-20.md`。基础组件、主题 CSS 与已审核批改页本轮未改。新预览待用户视觉审核；P5 最终全库回归与生产构建仍暂缓。

## 0. 状态与已确认范围

> P5 整理更新（2026-10-20）：已建立 [最终验收总表](2026-10-20-rain-p5-final-acceptance.md)、[87 模块矩阵](../rain/p5-component-matrix.md) 和 [13 项遗留台账](../rain/p5-open-issues.md)。本轮仅核对既有证据与文档，P5 尚未整体通过；新的重测试、全 story 扫描和生产构建继续暂缓。

> 交付更新（2026-10-20，r2）：用户确认当前 Table 配色与普通 Tabs 名称反馈后，已同步私有 React／Styles `3.2.6-rain.1`、雨课堂主题 `0.1.2`，上游源码基线仍为 3.2.6。只定向编译两个授权 Tabs 入口及相关声明，基线与旧归档核对后保留共享模块；独立解包消费、类型、CSS 以及 6008 示例关键路径已限定核验。示例有效输入后的旧错误残留仅在业务校验状态修正。旧交付与历史证据保留。详见 `docs/rain/consumer-verification.md`。P5 全库最终回归、生产构建、跨设备与生产验收继续暂缓，不视为全计划完成。

- 日期：2026-10-19。
- 本文是规划交付，尚未克隆 HeroUI、安装依赖、运行组件工程或修改任何组件。
- 新工程位置：`/Users/wenchengkai/CodexFile/hero ui-改造`。规划前该目录为空。
- 用户已选择 HeroUI，并明确要求全库本地化。
- 用户本轮确认：**沿用现有雨课堂组件库已确认的品牌色、字体和圆角，重新映射到 HeroUI。**
- 既有约束：其他视觉以 HeroUI 为准；以业务页面、卡片和面板重组为主，基础组件在需要时可修改。
- 后续执行须由用户另行发起。本计划不触发实现、提交、推送、发布、旧业务迁移或自动更新。

### 本轮预算采用的边界

1. 全量保存选定提交中的源码、工程配置、文档、示例、stories 和已有测试。
2. 本地可运行 HeroUI React 文档与全量组件预览；雨课堂浅色主题为第一版目标。
3. 保留 HeroUI 原有明暗主题；雨课堂深色主题另计。
4. 复用仓库已有中英文文档；新增中文使用指南，不逐页重新翻译或重写官方文档。
5. 含少量中文长文案和组合状态验收样例，不含完整课程、考试、批改业务开发。
6. 不含 Pro 付费资产、React Native 实现、Figma 改造、完全离线官网、生产发布或已有项目替换。

“全量源码已获取”“本地预览已跑通”“主题已验收”“可生产使用”分别记录，不用其中一个状态替代其他状态。

## 1. 已核验依据与候选版本

### 1.1 HeroUI 基线

2026-10-19 只读核验的最新正式 release 是 `v3.2.6`，发布于 2026-09-17，其提交为：

`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`

建议将其作为实施候选基线。实施开始时再次检查正式发布与具体需求，随后固定 tag、完整 SHA 和 lockfile；后续步骤都使用同一基线。

当前移动 `v3` 分支已在该 release 后发生变化。即使 package.json 版本号相同，组件、文档、示例或依赖也可能不同。因此不将在线官网、在线 MCP 或移动分支的数据直接用作固定版本的验收分母。

官方工程已连接本地源码：

- `packages/react`：组件实现、子组件、工具、stories 和测试。
- `packages/styles`：样式、主题和变体。
- `packages/storybook`：直接读取 React 包中的 stories。
- `apps/docs`：文档、注册 demo、源码查看及相关页面。
- `packages/standard`、`packages/testing`：内部工程与测试依赖，需要完整保留。
- 根配置、workspace、lockfile、构建脚本及其他版本内文件一起保留，不能只挑出四个目录。

官方开发入口可解析本地源码，发布产物的 exports 则涉及构建与 prepack。因此既要验证开发预览，也要验证打包后的真实引用。

### 1.2 全库规模的只读统计

以下是候选提交的静态统计，用于估算与计划，实施时必须自动重算：

| 清单 | 当前统计 | 含义 |
|---|---:|---|
| components barrel 导出模块 | 85 | 包括辅助模块和组合部件，不能叫作 85 个独立组件 |
| 独立 stories 文件 | 68 | 一个文件通常含多个状态示例 |
| React 组件文档 | 英文 73 页、中文 73 页 | 不含所有指南页，指南另外登记 |
| 注册 demo | 英文 681 项、中文 681 项 | 两种语言有大量对应项，不能当作 1,362 个不同设计 |
| demo TSX 文件 | 英文 683、中文 687 | 文件与注册项不完全一致，需检查未注册或辅助文件 |

组件族、子组件、文档页和 demo 不是一一对应关系。完整性的依据是交叉映射清单，而非某个总数。

## 2. 推荐目录与维护方式

下面为未来组织结构；除本计划文件外，尚未创建这些工程文件。

```text
/Users/wenchengkai/CodexFile/hero ui-改造/
├─ apps/
│  └─ docs/                         保留官方文档站、demo 和源码展示
├─ packages/
│  ├─ react/                        保留官方完整组件实现
│  ├─ styles/                       保留官方完整样式与主题
│  ├─ storybook/                    复用官方全量组件与状态预览
│  ├─ standard/                     保留官方工程工具
│  ├─ testing/                      保留官方测试基础设施
│  └─ rain-theme/                   新增：雨课堂主题
│     ├─ package.json
│     └─ src/
│        ├─ index.css               主题统一入口
│        ├─ rain-light.css          颜色及状态语义映射
│        ├─ typography.css          字体身份与回退策略
│        ├─ radius.css              圆角角色映射
│        └─ overrides.css           必要且记录原因的少量修正
├─ docs/
│  ├─ plans/                        实施规划
│  └─ rain/
│     ├─ README.md                  中文使用与启动说明
│     ├─ upstream.json              官方版本、SHA、来源与核验日期
│     ├─ brand-inputs.json          旧库品牌来源与文件内容摘要
│     ├─ theme-map.md               旧语义 → HeroUI 语义映射表
│     ├─ inventory.json             自动生成的全库清单
│     ├─ exceptions.md              缺项、远程依赖与覆盖说明
│     ├─ upstream-differences.md    本地工程适配与组件补丁记录
│     ├─ acceptance.md              验收范围、结果和遗留项
│     └─ ai/
│        ├─ index.md                AI 读取入口
│        └─ usage-rules.md          复用、改造、验证规则
├─ scripts/
│  └─ rain/                         少量清单生成、核验和预览启动脚本
├─ pnpm-workspace.yaml              保留官方 workspace，按需最小扩展
├─ pnpm-lock.yaml                   保留基线并记录本地必要变化
└─ package.json                    保留官方脚本，增加少量 rain 命令
```

原则：

- 官方 monorepo 是唯一组件源码工作区；不再嵌套另一套 vendor 仓库、包管理根和重复源码。
- 文档站、Storybook 和未来业务消费者都指向同一份本地 React/styles 包。
- 保留组件名称和 API，方便使用官方资料；不为每个组件新增 RainButton 一类空包装。
- 初版不创建全量 `rain-ui` 转发包。出现真实复用的业务组件时再新增相应包。
- 本地基础组件可以修改；每次改动须关联原因、受影响 API/状态、测试以及上游差异。
- 完整保存源码不要求业务页面引入所有组件；实际产物引用和体积需要独立核验。

## 3. 雨课堂主题如何映射

### 3.1 品牌输入

优先读取旧工程 `.worktrees/card-v2` 中的品牌事实，并用现有主目录副本交叉核对。它是只读输入，新项目不修改旧项目。

| 品牌事实 | 已找到的依据 | 本次处理 |
|---|---|---|
| 主品牌蓝 | `#1561F8` | 作为主操作颜色输入，其他蓝色按用途分别映射 |
| UI 字体 | PingFang SC、Microsoft YaHei、ui-sans-serif、sans-serif | 沿用字体身份和回退，保留 HeroUI 的字号与行高体系 |
| 关键数据字体 | LINE Seed JP App_OTF、SF Pro Rounded、ui-rounded、sans-serif | 只为需要该身份的数字内容提供选择，不覆盖全局中文 |
| 圆角档位 | 4、6、8、10、12、16px；full 为 9999px | 按控件、容器和浮层角色映射；圆形、胶囊保留其用途 |
| 颜色事实与语义 | color-registry.ts、token-contract.ts | 提取语义与状态，再映射到 HeroUI，避免整份复制 CSS |

已发现的输入差异：

- 主目录与 card-v2 的标题、数据字号不同。本次不继承旧字号和密度，符合“其他视觉以 HeroUI 为准”。
- 旧语义 `text-primary` 与新分类 `Text/Neutral/1` 存在不同取值；主操作蓝、品牌文字蓝、焦点蓝也各有用途。主题映射表要逐项写明来源和角色，不能统一替换成一个蓝色。
- 原项目未随包分发字体文件。第一版沿用字体栈和回退，不宣称已经获得 LINE Seed 等本地字体文件。
- 旧工作区存在未提交修改。记录具体源路径和内容摘要，不能只记 Git HEAD 就声称固定了输入。

### 3.2 主题映射表

`theme-map.md` 每行包含：雨课堂语义、原值、源文件和定位、HeroUI 目标变量/角色、作用组件、状态、决定依据、验收结果。

至少覆盖：

- 主操作及其文字前景、品牌文字、选中背景。
- 页面、卡片、浮层、输入框背景。
- 主要、次要、提示、禁用文字；常规与强调边框。
- hover、pressed、selected、focus-visible、disabled。
- success、warning、danger 及相应背景和文字。
- UI 字体、数据字体使用规则。
- 普通控件、卡片、浮层、大容器与完整圆形/胶囊圆角。

HeroUI 目标主要涉及 accent/foreground、surface、field、border、focus、状态色和 radius 相关变量；具体名称与派生关系以冻结版本源码为准。对于由 color-mix 等计算出的状态，先验证实际结果，再决定是否需要显式映射，避免把所有派生值重复维护。

配色、字体、圆角以外，沿用 HeroUI 的字号、行高、间距、组件高度、阴影、动效和布局。只有发现明确显示或交互问题时，才追加最小修正并记录原因。

主题应应用到当前预览文档的根节点，覆盖通过 portal 挂到 body 的菜单、弹窗、日期浮层等。原版与雨课堂并排比较时使用隔离 iframe，避免同一页面不同主题互相污染。

## 4. 文档、示例与预览如何组织

### 4.1 文档站：查用法和完整示例

保留 `apps/docs` 的 MDX、demo 注册表与源码查看机制。沿用其已有中英文版本，在雨课堂入口补充：

- 新项目如何启动、引用本地组件和加载雨课堂主题。
- 组件名称搜索、分类导航、主题说明。
- 原版 API、源码、相关 demo、Storybook 状态页之间的链接。
- 当前版本、主题版本和来源说明。

不手抄 681 个 demo，不另造一套参数文档。中文缺项或回退英文需要在清单中标记，不能把回退成功算作翻译已完成。

### 4.2 Storybook：看全量状态与做主题验收

直接使用官方 stories。新增主题选择项：

1. HeroUI 原版浅色。
2. HeroUI 原版深色。
3. 雨课堂浅色。

检查官方的 ready-only 过滤配置，确保全库验收时不会默默隐藏尚未标记 ready 的 stories。没有独立 story 的子组件映射到父组件示例；确实没有覆盖的组件补一个最小演示，而非重写已有示例。

主题切换需清理上一主题的 class/data 属性，并在 iframe 文档根上应用新主题。弹层、焦点、滚动区域和表单状态都需要跟随主题。

### 4.3 一个日常入口，两个复用的预览工具

建议在文档站内新增轻量“雨课堂组件中心”页面，汇总组件索引、主题概览、文档和 Storybook 链接；本地启动脚本提供入口地址。第一版无需再搭建独立 `apps/rain-preview`。

日常使用路径：

`打开组件中心 → 搜索组件 → 查看文档/demo → 进入 Storybook 调状态 → 查看源码 → AI 组合或改造`

源码修改后，两个入口均应反映同一份本地实现。具体访问地址和端口由启动脚本报告，避免把固定端口写死在大量文档里。

本轮仅加入四类主题验收样例：多字段表单、筛选列表、长标题卡片、窄宽评分面板。它们使用模拟数据，验证换肤与组合效果，不实现真实作业发布、批改、上传、保存或权限服务。

### 4.4 本地启动与远程资源

只读核验发现：官方 docs 有环境配置要求、Google Fonts、CDN 图片和官网服务入口；Storybook 也引用外部字体。获取源码后需要一次本地启动适配。

处理原则：

- 提供无私密凭据即可运行核心文档/预览的本地配置。
- 原版字体如需构建下载，登记网络要求；采用本地可用字体回退时明确记录差异。
- 核心预览不调用订阅、分析、反馈等官网外部服务；源码仍保留并在本地模式停用对应入口。
- 远程数据示例可增加清楚标记的本地 fixture 模式，保留原示例与来源。
- 外链图片、视频逐项登记；加载失败不能导致核心组件演示崩溃。完全离线媒体镜像不属于第一版承诺。
- 不把 `.env.example` 中的占位值直接当作可用配置，也不把构建完成等同于全部示例能运行。

## 5. AI 如何使用这套库

默认上下文仅包含：项目规则、冻结版本、雨课堂主题契约、组件索引。每次任务按需读取对应组件的 API、源码与 1–3 个相关示例，不把全库文档一次塞入上下文。

`inventory.json` 为人和 AI 共用目录，每个组件族至少记录：

| 字段组 | 内容 |
|---|---|
| 身份 | 稳定 ID、公开导入名、子组件、类别 |
| 来源 | HeroUI 版本、SHA、源码和样式路径 |
| 使用资料 | 中英文文档路由、demo ID、story ID |
| 主题 | 相关语义变量、已验证状态、必要补丁 |
| 验收 | 构建/渲染/交互/视觉状态与例外说明 |

AI 修改顺序：优先复用现有组件和示例；其次在业务层组合；需要复用时新增业务变体；公开接口不足时才改基础组件源码。

主题值集中维护，页面不随意硬编码品牌色和圆角。组件结构改造要保留必要的标签、键盘、焦点、禁用和错误行为。

官方 MCP 可以辅助查询，但返回的在线最新信息须与本地版本核对。本地已有的源码与同版本文档优先；禁止用旧 NextUI/v2 API 替换 v3 API。初版不需要自建 MCP、registry 服务或另一套组件平台。

## 6. 分阶段任务与工作量

以下人日是工程估算，不是已运行结果。按一名熟悉 React/Tailwind 的工程人员配合 AI、复用上游文档和示例、雨课堂浅色主题、适量设计评审估算。一个人日为约 8 小时有效工作。

| 阶段 | 任务 | 交付与验收重点 | 人日 |
|---|---|---|---:|
| P0 基线与映射输入 | 冻结正式提交；完整获取清单；记录旧库品牌来源 | 版本/SHA/lockfile、源文件摘要、组件/文档/demo/stories 交叉清单 | 1–2 |
| P1 原版本地运行 | 保留官方工程；处理本地配置、字体与服务入口；跑通源码构建、docs 和 Storybook | 原版可运行，预览确实读取本地源码，远程依赖有清单 | 2–3 |
| P2 雨课堂主题 | 颜色、字体、圆角映射；先验证代表组件，再扩展全库 | 独立主题包、主题映射表、状态问题清单 | 2–3 |
| P3 文档与预览组织 | 轻导航、主题切换、全量入口、缺失演示补齐、少量中文组合验收样例 | 文档与 Storybook 双向可达，已有示例不重复维护 | 3–4 |
| P4 AI 与真实引用 | 版本化索引、使用规则；验证打包后消费者 | AI 能定位用法，开发态和构建产物引用均成立 | 1–2 |
| P5 全库核验与收尾 | 自动覆盖检查、关键交互、逐组件族视觉评审、修复和交付说明 | 每项有结果；未验证内容和遗留问题明确记录 | 3–6 |
| **合计** | **完整可维护初版** | **不含业务迁移、Figma、Pro 和生产发布** | **12–20** |

### P0：固定输入和验收分母

未来创建：`docs/rain/upstream.json`、`brand-inputs.json`、`inventory.json`、`exceptions.md`、`scripts/rain/inventory.mjs`。

步骤：

1. 保留当前规划文件，核验正式 tag、完整 SHA 和源仓库，完整接入官方工程，不覆盖未知本地文件。
2. 保存官方许可和来源；对根 LICENSE 与包元数据的现存不一致如实记录，不自行给整库改写许可标识。
3. 记录旧库品牌文件路径、内容摘要和存在的冲突。
4. 从源码 exports、文档路由、demo 注册表、stories 生成交叉清单；区分组件族、子组件和工具。
5. 给缺少独立文档/演示的条目写覆盖映射或待补项，确保没有静默漏项。

通过条件：全库范围可数、版本可追溯、品牌输入可复核；不靠首页组件列表人工抄写。

### P1：先跑通原版

主要涉及：官方根配置、`apps/docs` 的本地环境与服务适配、`packages/storybook` 的本地字体策略、`docs/rain/upstream-differences.md`。

步骤：

1. 按冻结版本配置 Node/pnpm，审查安装和生成脚本，然后按 lockfile 安装依赖。
2. 先构建原始 React/styles，再运行 Storybook 和 docs；首次记录上游现有 jsdom 与 browser 行为测试结果，保留任何基线失败。后续按改动影响范围复跑，不重复扩大测试范围。
3. 处理本地环境和官网服务入口，避免运行预览需要营销服务私钥。
4. 检查本地源码解析和热更新；确认没有误用同名远程包。
5. 建立依赖及远程资源清单，记录尚未本地验证的功能。

通过条件：原版两套入口可运行，源码改动可在预览体现；本地适配范围和上游缺陷分开记录。

### P2：主题包与代表组件

未来创建：`packages/rain-theme/package.json`、`src/index.css`、`rain-light.css`、`typography.css`、`radius.css`、`overrides.css`、`docs/rain/theme-map.md`。

步骤：

1. 将已确认品牌事实映射到 HeroUI 语义；记录有冲突的映射及选择依据。
2. 实现独立主题入口，保持官方样式作为基础。
3. 先验证 Button、TextField、Select/ComboBox、Card、Table、Modal/Popover、Calendar、Tabs 等代表组件。
4. 验证焦点、错误、禁用、选中、弹层及长中文内容，修正主题变量和必要的少量样式。
5. 将通过的主题应用到全量入口，继续使用清单跟踪，不在代表组件通过后宣称全库完成。

通过条件：主题作用域和状态语义成立，变量来源可查，其他视觉结构仍沿用 HeroUI。

### P3：文档、预览与示例串联

主要涉及：`apps/docs` 中新增的雨课堂入口页、`packages/storybook/.storybook` 的主题控制及 decorator、`scripts/rain` 的启动辅助、少量新增验收 stories/demos。

入口页具体路径应依冻结版本的路由结构确定，不预先重排官方内容目录。

步骤：

1. 在现有文档站加入雨课堂入口与生成目录，不新建全库渲染器。
2. 扩展 Storybook 的主题合法值、根节点应用和旧主题清理逻辑。
3. 串联文档路由、源码、demo 和 story；检查 ready-only 与语言回退。
4. 给真正缺少预览的组件补最小用例，保留全部原有示例文件。
5. 加入四类中文组合验收样例，明确其模拟数据和范围。

通过条件：组件能从目录找到、资料相互可达、主题切换覆盖 portal、无隐性组件过滤。

### P4：AI 索引与消费验证

未来创建：`docs/rain/ai/index.md`、`usage-rules.md`、必要的临时消费验证夹具；项目 AI 规则在保留上游规则后补充雨课堂章节。

步骤：

1. 让索引引用同版本源文件与 demo，而非复制第二份文档。
2. 定义主题修改、业务组合和基础组件修改的路径。
3. 用一个表单/卡片组合任务检查 AI 能否找到正确 API 与主题入口。
4. 在隔离测试目录验证本地产物导入和 CSS 资源，确认 prepack 导出与开发态入口均可用。
5. 记录用户日常启动、引用、改造和定位问题的方法。

通过条件：全库可检索、实际可消费，验证不依赖联网查询最新版用法。

### P5：完整性、交互和视觉交付

未来更新：`inventory.json`、`exceptions.md`、`acceptance.md`；证据保存到单独的 `evidence` 目录。

步骤：

1. 重跑全量清单核验与构建，枚举所有注册 demo/story，记录失效引用与加载错误。
2. 原版完成基线检查，雨课堂主题完成组件族渲染和适用的关键状态检查。
3. 对高风险交互执行行为验证：菜单/选择器键盘、浮层焦点与 Escape、滚动、表单错误/禁用、日期和表格选择等。
4. 逐组件族审阅视觉，重点检查长中文、字体回退、窄区域、焦点和语义状态；截图是审阅材料，不能自动代表人工接受。
5. 验证构建产物消费、复现步骤和版本记录，输出已完成、未完成、例外及后续工作。

通过条件：无未解释的缺项。若上游缺陷或外部依赖仍使某项不可运行，应明确标记未完成并说明影响，不能宣称全库完全通过。

### 排期和可选增量

- 原版全库可用里程碑：累计约 3–5 人日（P0+P1）。
- 主题与预览成形：累计约 8–12 人日（至 P3）。
- 完整可维护初版：累计约 12–20 人日。
- 单人日历建议安排约 3–5 周，包含反馈、修复和视觉确认等待；多人/AI 并行不能按人数直接除以工期。
- 若构建环境、外链资源或品牌映射问题较多，可另留 3–5 人日风险预算，基线跑通后重估剩余工作。
- 雨课堂深色主题约另加 2–4 人日；不改变默认全量源码保留范围。
- Figma、旧业务迁移、完全断网、正式生产无障碍/跨设备验证、Pro 接入均单独估算。

## 7. 验证分层

| 层次 | 第一版应验证什么 | 不能据此推导什么 |
|---|---|---|
| 来源与清单 | 固定提交；完整文件与可达映射；缺项有解释 | 组件所有行为都正确 |
| 构建与引用 | React/styles、docs、Storybook 构建；开发与产物引用 | 所有交互都已验证 |
| 运行 | 注册 demo/story 可加载；控制台与资源问题分类 | 所有状态组合都已穷举 |
| 交互 | 关键键盘、焦点、选中、错误、禁用、浮层行为 | 整个业务流程已正确实现 |
| 视觉 | 全部组件族有审阅记录；主题语义、中文与圆角一致 | 用户尚未作出的视觉接受 |
| 可访问性与平台 | 自动检查及基本键盘验证；记录实际测试环境 | VoiceOver、Safari、真实触摸或全部生产要求已通过 |

不为每个 CSS 变量编写镜像测试；优先复用上游行为测试，新增测试用于本地适配、实际交互变化和主题作用域问题。

候选版本的主要验证入口（未来执行时先核对冻结脚本，本文未运行）：

```text
pnpm install --frozen-lockfile
pnpm build
pnpm build:docs
pnpm build:storybook
pnpm typecheck
pnpm --filter @heroui/react test:jsdom
pnpm test:browser
```

浏览器测试需要相应浏览器环境。新增源码或组件行为时执行相关测试；原版基线失败应先记录和定位，不能通过删除组件/测试来缩小全库范围。只做计划的本轮无需执行上述命令。

## 8. 后续维护

- 记录上游版本、雨课堂主题版本和补丁位置，确保可以区分官方变化与本地变化。
- 上游升级时先查看差异，再对新增/变更组件更新清单、资料、主题映射和相关验证。
- 本地主题、导航、环境适配的变化集中在少量文件，避免把原版组件统一改名或大规模格式化。
- 基础组件确需修改时保留行为测试，并在差异记录中标明原因，方便以后合并官方修复。
- 初期升级频率按业务需要决定；不设置未经请求的定时更新或自动发布。

## 9. 实施前仍需收敛的事项

1. 推荐正式 tag 已明确，实际启动时需再次核验并冻结；若要使用 release 后新增能力，应明确升级基线或加入单独补丁。
2. 品牌依据已由用户确认，但旧语义冲突与组件圆角角色还需在映射表内逐项定稿；不能把此表当作已经视觉验收。
3. 工作量默认雨课堂浅色主题；原版深色保留，雨课堂深色作为增量。
4. 本地源码和核心预览可运行是第一版目标，完全断网资源包不是默认要求。
5. 本计划不代表已获得、迁移或同步任何 Figma 文件，也不包含 Pro 资产。

## 10. 来源

### HeroUI 官方来源

- [正式发布 v3.2.6](https://github.com/heroui-inc/heroui/releases/tag/v3.2.6)
- [固定提交源码](https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e)
- [根工程脚本](https://github.com/heroui-inc/heroui/blob/v3.2.6/package.json)
- [workspace](https://github.com/heroui-inc/heroui/blob/v3.2.6/pnpm-workspace.yaml)
- [React 包与依赖](https://github.com/heroui-inc/heroui/blob/v3.2.6/packages/react/package.json)
- [组件导出清单](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/index.ts)
- [demo 注册表](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/apps/docs/src/demos/en/index.ts)
- [Storybook 配置](https://github.com/heroui-inc/heroui/blob/v3.2.6/packages/storybook/.storybook/main.ts)
- [Storybook 主题应用](https://github.com/heroui-inc/heroui/blob/v3.2.6/packages/storybook/.storybook/addons/theme/decorator.tsx)
- [文档环境定义](https://github.com/heroui-inc/heroui/blob/v3.2.6/apps/docs/env.ts)
- [文档站环境使用](https://github.com/heroui-inc/heroui/blob/v3.2.6/apps/docs/src/utils/env.ts)
- [文档站配置](https://github.com/heroui-inc/heroui/blob/v3.2.6/apps/docs/next.config.ts)
- [主题机制](https://heroui.com/en/docs/react/getting-started/theming)
- [AI 文档机制](https://heroui.com/en/docs/react/getting-started/llms-txt)
- [Figma 开源与 Pro 资源边界](https://heroui.pro/docs/react/getting-started/figma)

### 现有雨课堂输入（只读）

- [品牌与字体约定](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/SPIKE_BRIEF.md:61>)
- [字体栈](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/packages/foundations/src/typography.css:2>)
- [圆角契约](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/packages/foundations/src/token-contract.ts:147>)
- [颜色事实](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/packages/foundations/src/color-registry.ts:183>)
- [颜色选择与字体资源说明](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/docs/ai/token-selection.md:70>)
- [card-v2 排版尺度](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/.worktrees/card-v2/packages/foundations/src/typography-contract.ts:42>)
- [主目录排版尺度](</Users/wenchengkai/CodexFile/雨课堂-shadcn组件库架构/rain-classroom-vibe-ui-spike/packages/foundations/src/typography-contract.ts:42>)

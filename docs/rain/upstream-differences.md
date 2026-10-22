# 相对 HeroUI v3.2.6 的本地改动

基线提交：`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`。

截至 2026-10-20，后续还增加已审核批改业务组合、组件中心、版本化 AI 索引，以及三批状态复查示例。当前源码 596 个 stories，历史生产索引为主题接入时的 587；下文“仅新增一个 story”等描述对应当时阶段。第三批当时只修正复查示例的浮层窄屏排版，核心 React / Styles 和主题 CSS 未改，详见 [第三批记录](visual-review-batch-3-2026-10-20.md)。随后已按用户反馈增加表格配色和下述 Tabs 本地例外。旧 0.1.1 交付保留；当前 r2 私有交付为 `delivery/rain-heroui-local-2026-10-20-r2/`，React／Styles `3.2.6-rain.1`、主题 `0.1.2`，已生成私有归档并完成限定消费验证，源码上游仍为 HeroUI 3.2.6，没有生产发布。

## 原版实现

截至第三批主题复查，`packages/react`、`packages/styles` 的受版本控制源码未改动。原版阶段也未修改 Storybook；随后主题阶段增加下述切换与对照。所有第三方依赖版本、解析和许可证原文保留。

2026-10-20 后续用户明确要求标签名“单行、省略、悬停全名”，本地例外只修改 `packages/react/src/components/tabs/tabs.tsx` 的普通文字包装／原生 title 和 `packages/styles/src/components/tabs/tabs.styles.ts` 的 `tabLabel` 语义类；截断样式仍只在 Rain 主题包中。Tabs 选择、集合、指示器和焦点沿用原版，实际边界见 [标签反馈记录](tabs-label-feedback-2026-10-20.md)。这不授权其他基础组件或原版 CSS 变更。冻结的 0.1.1 交付不包含本地 Tabs 补丁和后续表格配色；r2 已包含这两处源码补丁与新 Table 配色，并完成记录中的实际消费核对。

r2 在隔离副本用上游工具链定向编译这两个 Tabs 入口。基线入口经记录的导入校准后与旧归档对应模块逐字节一致，编译可达的共享模块保持旧归档内容，只替换明确列出的 Tabs JS／样式槽及必要声明。源码、基线和产物 SHA、替换文件与限制保存在 r2 `patch-provenance.json`；根／子路径导入、Tabs 标签 SSR、样式槽、Bundler 类型及主题 CSS 核对见 `report.json` 与 [消费验证记录](consumer-verification.md)。这不是全库编译、全 story 扫描或生产站构建。

用户本次“确定。继续推进”限定确认当前表格衬底／表头背景 `#EBEFFF`、表头文字 `#7485A8`，以及普通 Tabs 名称的单行、省略和原生悬停全名；不扩展为任意富文本、全库所有状态或产品生产验收。源码基线、私有补丁身份、工程检查与用户页面确认分别记账。

## 雨课堂主题阶段（用户随后授权）

- 新增 `packages/rain-theme`，唯一 CSS 入口以根级属性启用颜色、字体族和圆角变量；原版 Circle/Pill、尺寸、密度、字重、阴影、动效与交互保留。
- docs / Storybook package metadata 和 lockfile 仅增加本地主题包链接及其空 importer。锁文件 packages/snapshots 全段与上游逐字一致；来源校验见主题证据 `source-checks.json`。
- docs 增加主题 provider、独立选择存储和菜单选项；启用 Rain 时强制亮色并暂挂原 preset，切回恢复。首页局部色彩控件暂停，代码高亮尊重强制模式；主题编辑器和独立 Showcase 保留原主题。
- Storybook 新增 rain-light 合法值、根节点作用域与浅色外壳映射，保留原 Light/Dark。仅新增一个中文组合对照 story，原有全部 586 stories 未移除。
- 新增切换/水合/存储降级测试及实际编译样式回归。静态清单中的主题/人工验收字段改为 not_checked，避免清单工具硬编码过时进度；运行验收单独记录。
- 映射与有限取舍见 `theme-mapping.md`；本轮证据与未验收范围见 `theme-acceptance.md`。

后续状态专项仅调整主题包：成功/警告 soft 文案恢复 HeroUI 的原版派生公式；三个 picker 浮层及主表格外壳在 Rain 作用域下补齐 16px 圆角映射。新增全量 story 渲染、CSS 状态及真实 React 浏览器测试，记录在 `state-audit.md`。React / Styles 核心源码仍未修改。

## 本地文档环境

- `apps/docs/env.ts` 新增默认关闭的 `NEXT_PUBLIC_LOCAL_PREVIEW`。
- 本地模式下：布局不挂载 Vercel Analytics；PostHog 不初始化；Pro 搜索与价格请求不发起；Newsletter 和 Changelog POST 提前返回 503。
- 普通官方模式保持默认行为；专用 `local:preview` 启动器强制本地模式与 development 环境，避免已有配置或终端变量意外关闭隔离。
- 增加公开环境示例、使用说明和 6 项接口/分析隔离测试。没有填入任何私钥。
- `turbo.json` 将本地配置及相关环境变量纳入缓存输入。

## 工程入口与清单

- 根 `package.json` 只追加 `local:preview`、`local:inventory`、`local:inventory:check` 三个命令；未新增依赖。
- `scripts/rain/preview.mjs` 同时启动官方文档开发服务与完整 Storybook，支持端口覆盖，退出时清理本次启动的进程组。
- `scripts/rain/inventory.mjs` 从 TypeScript/MDX/注册表和 Storybook 构建索引生成交叉清单。其静态结果不声称运行或视觉验收。
- 增加规划、来源、品牌输入、使用说明、验收和证据文件。

## 上游自动生成内容

- Next 开发服务器生成 `apps/docs/AGENTS.md` 与 `CLAUDE.md`，已保留。
- 文档 predev/prebuild 会重生成 `theme-presets.css`；本轮仅用原有 Prettier 还原格式后验证与上游无差异。
- `.env.local`、依赖、缓存和构建输出均沿用忽略规则，不被伪装成源码变更。

许可证：根 LICENSE 为 Apache-2.0，package metadata 写 MIT；本轮保留原文与差异，不自行给全仓库重新定许可。

没有 Git 提交、推送、发布、生产迁移或对旧雨课堂库的写入。

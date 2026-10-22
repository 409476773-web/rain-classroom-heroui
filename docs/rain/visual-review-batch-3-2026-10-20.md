# 第三批重点组件复查与交付同步

> 本页保留第三批当时的检查和 0.1.1 交付快照。下文“本轮未改核心源码／主题”“与当前源码一致”等均限定为该时点。后续已按反馈调整 Table 并加入两个授权 Tabs 源码补丁，最新交付为 [r2](../../delivery/rain-heroui-local-2026-10-20-r2/README.md)，验证见 [消费记录](consumer-verification.md)。Table／普通 Tabs 的有限用户确认不扩展为第三批所有浮层／错误页或全库通过；当前总表见 [P5 清单](../plans/2026-10-20-rain-p5-final-acceptance.md)。

2026-10-20，按“剩余重点组件复查＋交付包同步”推进。HeroUI React / Styles 继续固定 3.2.6；私有主题交付版本升为 0.1.1。主题 CSS 本轮未变，基础组件与样式源码、已审核的课堂练习批改页均未修改。当前普通按钮圆角仍为已确认的 10px。

## 预览与资料入口

- [表格、标签页与卡片](http://127.0.0.1:6006/?path=/story/components-theme-state-review--layouts&globals=heroui-theme:rain-light)：宽容器与 320px 窄容器、长中文、选中与禁用、键盘及内部按钮反馈。
- [浮层与长中文](http://127.0.0.1:6006/?path=/story/components-theme-state-review--overlays&globals=heroui-theme:rain-light)：Modal / Drawer 内部滚动、表单、Toast 成功与错误反馈。
- [错误提示状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--error-messages&globals=heroui-theme:rain-light)：独立 ErrorMessage、长文和 TagGroup 条件错误。

三页共用现有主题切换器，可切回原版。新增源码为 `packages/storybook/.storybook/stories/rain-state-review-layouts.stories.tsx`、`rain-state-review-overlays.stories.tsx` 及各自 `.styles.ts`。数据为虚构页内状态，不提交真实数据。

ErrorMessage 的组件中心预览已指向本次真实 story，复制 AI 上下文仍保留其独立文档、源码和示例。当前目录 87 个源码模块均有 Storybook 路由，包含明确标注的父级／组合预览；不表示 87 个独立组件或全部状态均已验收。中英文 AI 指南已同步三页入口和当前交付位置。

## 发现与修复

320px 宽预览中，Modal / Drawer 的长标题与关闭按钮挤占空间，底部较长按钮会横向溢出。仅在这两个复查示例中为 Heading 增加 `pe-8`、Footer 增加 `flex-wrap`；沿用原版间距与控件样式，原版和雨课堂使用同一布局修正。未修改基础浮层源码或主题。

当前布局示例的自动无障碍面板还指出两个具名 Card 缺少可命名语义；仅为该示例补上 `role="article"`，使现有 `aria-label` 有效，不改视觉。修正后当前面板为 Violations 0、Passes 34、Inconclusive 1，语义提示消失，见 `layouts-a11y-after.txt` / `.png`。剩余一项 Tabs 对比度自动工具无法判断：提示选中项与其他元素重叠，不能据此宣称全库对比度通过。

未为 Card 虚构 hover、disabled、invalid 变体；用内部按钮检查交互。Table 原版选中背景、Tabs 原版禁用表现继续保留，不因本轮示例额外换肤。

## 实际浏览器定向检查

证据目录：`evidence/runtime/rain-visual-batch-3-2026-10-20/`。以下为本机实际操作和读取结果，不代替用户视觉审核。

| 对象 | 本轮结果 | 主要证据 |
| --- | --- | --- |
| Table | 实际选中两行、全选跳过禁用行；方向键跳过禁用行；320px 容器内表格保持 704px 并可横向滚动，页面无横向溢出 | `table-interactions.json`、`layouts-tables.png` |
| Tabs | 方向键跳过禁用项，End 到最后项；窄容器内长标题保持原版横向滚动并随焦点可见 | `tabs-card-interactions.json`、`layouts-tabs.png` |
| Card | 320px 卡片无内容横向溢出，中文标题换行，内部按钮计数反馈正常，圆角 16px | `tabs-card-interactions.json`、`layouts-card.png` |
| Modal | 长文内部滚动，底部操作可见；错误表单、只读信息、禁用按钮表现正常；Tab 循环和 Escape 关闭后焦点返回触发按钮 | `modal-open.json`、`modal-interactions.json`、`modal-mobile-fixed.png` |
| Drawer | 可编辑表单、长文滚动、禁用操作正常；Tab 循环和 Escape 返回触发按钮；侧边直角保留原版 | `drawer-open.json`、`drawer-interactions.json`、`drawer-mobile-fixed.png` |
| Toast | 真实触发成功／错误长文，键盘关闭单条及清空提示；320px 宽预览中文换行 | `toast-states.json`、`toast-danger.png`、`toast-mobile.png` |
| ErrorMessage | 三种示例使用雨课堂错误色；TagGroup 选择后条件错误消失，清空后恢复；原版错误色可切回 | `error-message-interactions.json`、`errors-original.json`、`error-messages.png` |
| 组件中心 | 搜索 ErrorMessage、跳转实际 story、复制含自有文档与新预览的 AI 上下文 | `error-center-context.json`、`error-center-context.png` |

布局页两主题抽取的 20 处节点中，padding、gap、字号、行高、字重、opacity 和 transition 没有差异，见 `layouts-metric-differences.json`。原版浮层和错误色另存 `overlays-original.json`、`errors-original.json`。这些结果只说明所取节点与路径，不能扩展为全库视觉一致性保证。

Storybook 的原版 React Scan 浮动工具栏在部分窄屏截图中遮挡局部；没有修改该插件或把工具栏遮挡判为组件缺陷。第二批已记录的 CalendarYearPicker 焦点恢复限制仍保留，上游进行中标记没有移除。

## 第三批当时交付（0.1.1）

当时复制入口：[`delivery/rain-heroui-local-2026-10-20/README.md`](../../delivery/rain-heroui-local-2026-10-20/README.md)。其中包含 React 3.2.6、Styles 3.2.6、Rain Theme 0.1.1 三个归档、版本与 SHA 清单、最小组合示例及上游根许可证原文。旧 0.1.0 历史归档保留，不覆盖。

主题归档解包后的 `index.css` 与当前主题源码逐字节一致，SHA-256 为 `3a681c04190cecbd82e8a096645d004438ab8e58ac109a3fc79f270432b0483d`。本轮前后 lockfile SHA 相同。没有重新构建 React / Styles JavaScript；类型声明只在隔离副本按上游配置生成。

[独立消费者预览](http://127.0.0.1:6007/) 从真实归档导入三个库，组合表单、卡片与 Modal。空提交显示错误并聚焦输入；输入反馈后打开 Modal，portal 继承雨课堂主题，主按钮为 10px、Modal 为 16px 圆角；关闭后焦点返回触发按钮、输入保留。见 `delivery-browser.json`、`delivery-modal.png`、`delivery-example.png`。第三方依赖复用本机安装；不是全新联网安装，详见 [消费验证记录](consumer-verification.md)。

## 检查与待验收边界

- 新增与修改文件的定向 ESLint、Storybook 和文档站类型检查通过。
- 目录生成器单文件测试 12/12、生成物同步检查通过；三个归档 SHA 校验通过。
- 核心 React / Styles 源码相对冻结提交无差异；交付主题源码一致，lockfile 未因本轮变化。
- 当前静态源码包含 596 个 stories；历史生产索引仍为 587，新增 9 个尚未进行生产构建。开发索引已注册本轮三个实际路由。
- 没有运行重测试、全库 story 扫描或生产构建，没有提交、推送、发布或迁移其他工程。

本批工程定向检查完成，三页集中预览及交付示例仍待用户视觉审核。全库最终回归、跨浏览器／设备／辅助技术验证、全新联网安装与发布分别保留，不能继承历史或已审核批改页的验收结论。

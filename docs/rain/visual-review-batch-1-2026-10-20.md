# 第一批主题视觉复查：按钮、输入与选项

2026-10-20，按计划推进 P5 的限定人工复查。基线仍为 HeroUI 3.2.6；当前已审核的批改示例和 10px 按钮圆角不变。本记录不替代用户视觉审核，也不代表全库回归完成。

## 复查入口

三页集中使用原版公开组件，位于 Storybook 的 `Components / Theme / State Review`，顶部可切换 HeroUI Light、HeroUI Dark 与雨课堂 Light：

- [按钮与按钮组](http://127.0.0.1:6006/?path=/story/components-theme-state-review--buttons&globals=heroui-theme:rain-light)：尺寸、图标、变体、禁用、横纵连接、RTL、单项和分离式组。
- [输入提示与表单状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--fields&globals=heroui-theme:rain-light)：空值、已输入、只读、禁用、错误、次要变体、固定前后缀及 Select。
- [列表选中与浮层状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--selections&globals=heroui-theme:rain-light)：单选、多选、禁用且选中、危险选项与 Select 浮层。

源码位于 `packages/storybook/.storybook/stories/rain-state-review-*.stories.tsx`，共用 `rain-state-review.styles.ts` 的页面布局。未复制基础组件实现，没有为故事硬编码品牌色或控件圆角。虚构内容仅在当前页面参与选择，无删除、提交或成绩写入。

## 本批修复

产品改动仍集中在 `packages/rain-theme/index.css`：

1. **SearchField 空值提示漏映射。** 专用 `.search-field__input` 没有继承普通 Input 的 placeholder 规则，原先仍使用正文色的半透明值；现在在 Rain 根作用域映射为已确认的 `--field-placeholder = #A0ACC5`。
2. **NumberField 同类遗漏。** `.number-field__input` 使用同一浅灰蓝提示角色；已输入数字、加减按钮及原版字段状态保持。
3. **InputGroup 持久前后缀过浅。** USD、https:// 等内容原先随 placeholder token 变浅；现在使用已有辅助文字色 `--muted = #56688F`，实际空值提示仍保持 `#A0ACC5`。

均只改变颜色映射，没有修改 `packages/react` 或 `packages/styles` 的受控源码、业务状态、尺寸、阴影、动画及键盘机制。移除 Rain 根标记后恢复原版样式。

## 实际页面检查

证据目录：`evidence/runtime/rain-visual-batch-1-2026-10-20/`。通过应用内浏览器操作实际 Storybook 组件，不以构造 data 属性代替交互。

| 范围 | 观察结果 | 证据 |
| --- | --- | --- |
| Button / ToggleButton 四类按钮及组 | 64 个节点与原版浅色对照，所比高度、padding、gap、字号、行高、字重、边框宽度、透明度和过渡属性无差异；Rain 按钮为 10px，连接组仅外缘圆角 | `buttons-rain.json`、`buttons-original.json`、`button-metric-differences.json`、`buttons-rain.png` |
| 按钮交互 | 主按钮悬停为 `#0F52DC`；键盘焦点环仍在；Tab 跳过禁用按钮；Space 切换 Toggle；RTL 方向键移到第二项 | `button-interactions.json`、`button-groups-rtl.png` |
| 提示文字 | 18 个实际 placeholder-bearing 输入／多行输入节点为 `rgb(160,172,197)`；包含搜索、数字的次要、禁用、错误和只读样本 | `search-placeholder-before.json`、`number-placeholder-before.json`、`fields-placeholders-after.json` |
| 输入正文与字段状态 | 搜索输入和 18.5 分数字正文仍为 `#14233C`；数字字段焦点环保持；所测错误信息可见 | `fields-input-state.json`、`number-focused.json`、`fields-focused.png` |
| 持久前后缀 | 6 个单位／网址前后缀由 `#A0ACC5` 恢复为 `#56688F` | `affixes-before.json`、`affixes-after.json`、`affixes-and-selects.png` |
| ListBox | 普通选中 `#EAF2FF`，选中悬停 `#DCE9FF`；禁用且选中保留 0.5 透明度；危险选项不强加品牌底色 | `lists-initial.json`、`list-interactions.json` |
| 列表键盘 | 方向键跳过禁用周同学；Space 选择许同学，保留焦点环；多选 Space 取消一项，其他选中项保留 | `list-interactions.json` |
| Select portal | 已选项浅底与禁用项正确；方向键跳过禁用组，Enter 选中第二组；Esc 关闭后焦点回到触发按钮 | `select-open.png`、`select-interactions.json`、`select-settled.json` |
| 原版隔离 | 列表切回原版后恢复透明选中底；Search/Number 和固定前后缀恢复原版颜色；切回 Rain 后重新应用映射 | `lists-original.json`、`fields-original.json`、`fields-rain-restored.json` |

列表保持原版默认选择方式：方向键移动焦点，Space 选择；点击当前选中项可取消。没有为视觉复查改动这一机制。焦点与浮层退出存在原版过渡，关闭结果以 `select-settled.json` 为准。

## 轻量工程检查与边界

- 三份新增 story、共享布局和 Storybook 配置的定向 ESLint 通过；Storybook 类型检查通过。
- 已刷新静态清单和 AI 目录，`pnpm local:catalog:check` 通过，仍为 87 个源码模块。
- 开发预览已实际打开三页。静态源码现在为 591 个 story exports；已有生产索引仍为 587 stories。差额为既有批改 story 加本批 3 个复查 story，未为消除历史产物差异运行生产构建。
- 未运行新测试套件、全 story 扫描、生产构建或跨浏览器／移动端验证。深色保留原版，本批实际对照为原版浅色与 Rain。
- 浅占位提示、图标及前后缀的全量对比度验收未在本批执行；历史状态检查属于修改前快照。

2026-10-20，用户在本批按钮预览页回复“确定。继续下一批”，据此继续推进 Menu 与年份入口。此确认不扩展为全库、全部状态或生产验证通过。后续见 [第二批复查记录](visual-review-batch-2-2026-10-20.md)，CalendarYearPicker 仍保留上游进行中身份。

# 第二批主题复查：Menu 与年份入口

2026-10-20，继续限定的 P5 页面复查。固定 HeroUI 3.2.6；保持当前雨课堂颜色、字体与圆角，基础组件及已审核批改页均未修改。没有发现本批需要新增的换肤补丁；发现的一项年份焦点问题在原版中也存在，单独记录为未解决的上游限制。

## 预览与定位

- [菜单状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--menu&globals=heroui-theme:rain-light)：真正的公开 Menu，包含普通命令、分组、快捷键提示、禁用、危险项、受控单选与多选，操作仅在页面显示反馈。
- [日历与年份入口](http://127.0.0.1:6006/?path=/story/components-theme-state-review--calendar-navigation&globals=heroui-theme:rain-light)：Calendar、RangeCalendar 的公开年份部件，以及 DatePicker 浮层内的 Calendar；固定虚构日期与明确范围，包含日期表单禁用和错误样本。
- [组件中心](http://127.0.0.1:3100/cn/docs/react/rain)：搜索“菜单”或“年份”，直接跳转本批预览；[AI 指南](http://127.0.0.1:3100/cn/docs/react/rain/ai)也提供入口和已知限制。

Storybook 位于 `Components / Theme / State Review`，沿用顶部主题菜单。新 story 为 `rain-state-review-menu.stories.tsx`、`rain-state-review-calendar.stories.tsx`，共用已有页面布局。入口配置改为匹配 `rain-state-review-*.stories.tsx`，不再逐个列举同类文件。

Menu 根组件直接使用 React Aria Menu；Dropdown.Menu 是另一套包装，不能用 Dropdown 的覆盖代替它。Menu 选中继续通过原版圆点或勾选表达，没有套用 ListBox 的新增浅品牌选中底色。快捷键只展示提示，不注册全局按键。年份入口需要父 Calendar／RangeCalendar 上下文，没有创建独立包装组件。

组件目录生成器只为这两个模块增加明确的本地预览映射，并验证 story 文件、导出和实际组件／父组件引用。开发索引已确认两条真实 ID；证据为 `development-index-entries.json`。它不改写历史生产索引。年份条目、预览说明和复制出的 AI 使用说明均保留“进行中”与焦点限制。

## 实际页面检查

证据目录：`evidence/runtime/rain-visual-batch-2-2026-10-20/`。本批通过应用内浏览器定向操作，没有扫描全库。

| 范围 | 实际结果 | 证据 |
| --- | --- | --- |
| Menu 默认与状态色 | 普通 Label 为 `#14233C`，危险项为 `#B52A36`，禁用项透明度 0.5；单选／多选保持原版指示器 | `menu-rain-initial.json`、`menu-overview.png` |
| Menu 交互 | 方向键从保存草稿跳过禁用归档项，落到危险样本；Enter 触发一次页内反馈；单选切换、多选 Space 取消一项正常，焦点环保留 | `menu-interactions.json` |
| Menu 原版对照 | 12 个节点所比高度、padding、gap、字号、行高、字重、透明度与过渡属性无差异；原版颜色恢复 | `menu-original.json`、`menu-geometry-differences.json` |
| 年份颜色与几何 | 当前年份为 Rain accent `#1561F8` 配白字，键盘焦点为 `#3D7BFF`；10 个年份节点的高度、padding、字号、行高及圆角与原版一致 | `calendar-rain-selected.json`、`calendar-original-open.json`、`calendar-year-metric-differences.json` |
| 单日年份导航 | 打开时焦点落到 2026；ArrowRight 到 2027，Enter 将浏览位置切到 2027 年 1 月并关闭年份面板 | `calendar-year-arrow.json`、`calendar-rain-after-choose.json` |
| 范围年份导航 | 年份列表限定 2026–2028；End 到 2028，焦点环保留，Esc 关闭年份列表 | `range-year-interactions.json` |
| DatePicker 表单与 portal | 禁用触发器不可用，错误信息为 `#B52A36`；浮层白底、16px 圆角，内部选中年份为品牌蓝；Esc 关闭整个日期浮层后焦点回到触发器 | `date-picker-fields.json`、`date-picker-year-open.json`、`date-picker-closed.json` |
| 组件中心／AI | 中文“菜单”“年份”搜索可达对应条目，链接携带 Rain 主题；复制出的年份上下文含项目根目录、真实 story ID 和已知焦点限制；中文指南已显示两个入口 | `center-preview-links.json`、`year-ai-context.txt`、`center-year-context.png` |

年份 hover 规则已按本地源码核对 accent-hover／default 角色，本批没有单独记录年份单元格的真实指针悬停。没有验证全部日期界限、历法、只读组合和所有设备输入路径。

## 未解决：上游年份面板的焦点恢复

在原版 HeroUI Light 和 Rain 中，均可按以下步骤复现：

1. 打开内联 Calendar 的年份入口，当前焦点在 2026。
2. ArrowRight 移到 2027，Enter 选择。
3. 日期网格返回、年份面板关闭，但稳定后焦点仍位于已隐藏、移出 Tab 顺序的 2027 年按钮。

RangeCalendar 的年份列表按 Esc 关闭后也观察到同类结果。原版对照见 `calendar-original-after-choose.json`；Rain 见 `calendar-rain-after-choose.json`、`range-year-interactions.json`。

源码路径 `packages/react/src/components/calendar-year-picker/calendar-year-picker.tsx`：`handleYearSelect` 只关闭面板并调用年份变化；网格 Esc 路径只关闭状态。关闭后网格仍挂载并设置 aria-hidden，年份 cell 移出 Tab 顺序，但没有恢复现有 DOM 焦点。Calendar 与 RangeCalendar 共用此实现。

本批按“保留 HeroUI 原版交互”的要求不修改此基础行为，也不使用故事局部事件掩盖问题。CalendarYearPicker 继续标为上游进行中，**不计为完整键盘验收通过**。日期浮层整体关闭时的焦点恢复属于外层机制，本次已单独确认正常；不能据此推断内部年份面板的焦点问题已解决。

## 工程检查与保留边界

- 新增 story／入口配置、组件中心改动与目录生成器的定向 lint 通过；Storybook 和文档站类型检查通过。
- 目录生成器单文件轻量测试 11/11 通过，包含缺失文件、导出或真实组件引用时拒绝生成的回归检查。
- 静态清单与组件目录已同步，仍为 87 个源码模块；现在 593 个静态 story exports，历史构建仍为 587 stories。6 项差额是批改示例及两批共 5 个复查样本，继续保留 `mismatch`，没有重新生产构建。
- Storybook 为固定日期样本补充 `@internationalized/date = 3.12.4` 直接依赖，复用已锁定版本。第三方 packages／snapshots 段前后 SHA-256 均为 `2e172182190ee50f4044d94d2635e265c8a79f3b28ad4ae1005cb9448e9a1f9b`，没有升级或重新解析第三方依赖；冻结 lockfile 离线安装通过且跳过脚本。
- `packages/react`、`packages/styles` 的受控源码无改动；本批没有修改 Rain 主题 CSS、批改页或旧雨课堂库。
- 没有运行重测试、全 story 扫描、生产构建、提交、推送或发布。跨浏览器、移动设备与完整无障碍验收仍待后续。

## 用户确认

2026-10-20，用户在本批“日历与年份入口”预览页回复“确定”，记录为本批预览当前呈现的确认。

CalendarYearPicker 仍保留上游进行中身份，年份面板的焦点恢复问题继续作为未解决限制；完整键盘、跨设备和生产验证仍按各自记录处理。重测试、全 story 扫描与生产构建继续暂缓。本次只更新确认记录。

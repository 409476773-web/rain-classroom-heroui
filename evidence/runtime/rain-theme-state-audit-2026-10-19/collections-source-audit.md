# 集合、卡片与导航主题检查

检查时间：2026-10-19。对象：固定 HeroUI 3.2.6 源码、当前 `packages/rain-theme/index.css`。这份报告是源码和编译样式检查，不是全部组件的人工视觉验收。

## 方法与范围

- 阅读 24 份组件 CSS：list-box、list-box-item、list-box-section、menu、menu-item、menu-section、card、surface、table、tabs、breadcrumbs、accordion、disclosure、disclosure-group、pagination、tag、tag-group、chip、link、toolbar、empty-state、badge、header、separator；对照相关 React 源码中的状态、变体、slot 与选中指示器。
- 实际编译 pinned `@heroui/styles` 与 Tailwind，在 Chromium 中跑 93 个状态/变体 fixture，对比原版 light、原版 dark、雨课堂。
- 新增 `scripts/rain/collection-state.test.mjs`：3 个测试，含 93 个集合 fixture，以及 4 个语义状态色 × 4 个承载表面 × normal/hover 的 32 组组合。浏览器 Canvas 把 OKLCH / color-mix 转为 sRGB，透明色先与实际父表面合成，再计算文字对比度。
- fixture 用与原版 CSS 匹配的 DOM、BEM 和 `data-*` 属性测试样式。它不声称执行了 React Aria 的选中、排序、拖拽、虚拟滚动或键盘事件；真实交互应看相应浏览器测试记录。
- 比较导入无副作用、切回原版精确恢复，以及 padding、gap、最小高度、字号、行高、字重、字距、禁用透明度、焦点轮廓几何、transition 和 transform 保持不变。

## 已修复的映射问题

Rain 第一版把 `success-soft-foreground`、`warning-soft-foreground` 直接映射到 `#18794E`、`#A55B00`。在透明浅色背景与页面/第三表面合成后，有 11 个普通字号文本组合低于 4.5:1。

其中一个明确的换肤回归：warning soft Chip 在页面表面中，原版 4.79:1，雨课堂第一版 4.29:1。success soft 的页面组合约 4.48:1，原版也约 4.48:1；这不是新增上游行为问题，但本次重新验证发现 Rain 当前角色映射同样没有足够余量。

旧库的其他 Orange / Green 文案分类值更浅，没有更深的已确认替代值。因此修复只移除上述两个 Rain 前景覆盖，恢复 HeroUI 原有派生规则：

- success soft foreground：`color-mix(in oklab, var(--success) 80%, var(--foreground) 60%)`
- warning soft foreground：`color-mix(in oklab, var(--warning) 80%, var(--foreground) 70%)`

派生规则输入仍是已确认的雨课堂颜色。状态实体色、白色实体前景、soft 背景透明度、hover 背景、状态选择器、字号与交互均未改动。修复后成功/警告的 16 组 normal/hover × 承载表面组合最低分别为 6.75:1 / 6.86:1。全部 32 组通过 4.5:1；其余最低组合是 danger soft hover 在第三表面上约 4.51:1。

证据：`collections-tests-before-fix.log` 先红（2 pass，1 fail）；`collections-tests-after-fix.log` 修复后 3 pass。`collections-status-contrast.json` 保存修改前与原版公式候选的逐项计算；`collections-computed-before-fix.json` / `collections-computed.json` 保存 93 个样本的修改前 / 修改后计算样式。

## 覆盖矩阵与保留项

| 组件族 | 本轮 CSS 状态 fixture | 源码检查结论 |
| --- | --- | --- |
| Card / Surface | Card 4 种表面变体 | Card 是展示容器，原版没有 hover、disabled、invalid 行为；保持原版。16px 容器圆角、文字/描述及表面映射正常。 |
| ListBox / Menu items | default/danger × 默认、悬停、选中、禁用、聚焦、按下，共24组 | 选中主要由勾选/圆点表达，原版没有品牌选中底色，不应擅自加。Hover 使用 default；danger 文案使用 danger；禁用 .5、焦点轮廓和按下缩放保留。 |
| Table | primary/secondary × 默认、悬停、选中、禁用、聚焦、drop target，共12组 | 行/单元格焦点位置、选中和拖放角色照原版。边缘单元格使用12px，内部角不应全变圆。虚拟表格样式分支源码保留，fixture 不等于虚拟滚动交互测试。 |
| Tag / TagGroup | default/surface × 默认、悬停、选中、禁用、聚焦、选中悬停，共12组 | 选中用accent-soft、hover用accent-soft-hover。TagGroup错误/描述依赖组合的共享原语；没有另造错误控件。 |
| Tabs | primary/secondary × 默认、悬停、选中、禁用、聚焦，共10组 | selected前景/segment与secondary下划线均使用对应语义角色。滚动箭头、separator、焦点和动画按原版。 |
| Chip / Badge | Chip 5种颜色 × 4种变体，共20组；Badge源码核对 | 展示型组件不虚构 hover/disabled/invalid。soft前景修复同时覆盖使用相同角色的Badge。 |
| Pagination | 默认、悬停、聚焦、禁用、active、按下，共6组 | 当前页是原版中性背景，不改成品牌实体按钮。圆形/胶囊和按下scale保留。 |
| Breadcrumbs / Link | 默认、悬停、聚焦、禁用、current，共5组 | current使用link，普通项muted，下划线/焦点/禁用保持原版。 |
| Accordion / Disclosure | 源码检查 | 折叠/展开、pointer hover、焦点、禁用、separator、圆角及动画状态选择器未变。Accordion的native hover优先规则是上游刻意设计，不补改data-hovered。 |
| Section / Toolbar / Header / EmptyState / Separator | 源码检查 | 继承语义文字/表面/分隔色；布局、分组、导航、阴影和尺寸保持原版。无独立交互状态的容器不新增状态。 |

## 确认保留的原版特征与限制

1. Tabs 未选中项 hover 使用整个项目 `opacity: .7`。普通文字的合成对比度在原版 primary/secondary 约2.48/2.61，雨课堂约2.81/2.84。此机制属于上游已有特征，并非雨课堂回归；本任务要求保留原版视觉与交互，因此记录而未改写控件的 opacity 或字号。不能据此宣称全库所有状态已通过文字可访问性审计。
2. Table primary 的 hover/selected 用 `surface` 的40%/10%叠在 `surface-secondary` 上。雨课堂确认的 secondary `#FAFCFF` 比原版更接近白色，所以行底变化更淡。选中勾选和焦点环仍独立存在；本轮保留确认的表面映射与原版状态公式，没有额外新增品牌选中底或改变表格交互。后续人工视觉可判断是否需要新的表面角色授权。
3. disabled 内容继续原版透明度机制，不把其文字按可操作普通文本的4.5:1门槛强行改色。
4. Card、Chip、Badge等展示容器没有自身表单错误状态；错误状态通过其内部表单/状态原语呈现。不能通过强加 `data-invalid` 给无对应样式的容器宣称错误态已测试。
5. 保留原版的 inline `rounded-*` 计算与基础 `--radius`，ListBox/Menu item、Tag、Tabs、Chip、Pagination 不因覆盖容器圆角变量而被强改形状。

## 结果

- 集合测试3/3通过（含125个状态/表面 fixture）；ESLint零告警、Prettier通过。
- 本任务只新增测试与证据；共享主题两处变量移除由主任务集中完成。
- `packages/react`、`packages/styles` 未在此次集合检查中修改。
- 本记录不代表 Safari、VoiceOver、真实设备、全部尺寸/RTL/缩放组合或全业务流程已验收。

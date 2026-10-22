# 表单组件源码审计与容器圆角修复

日期：2026-10-19。基准：本地固定 HeroUI 3.2.6。检查对象：`packages/styles/components`、共享状态 utilities、默认主题变量，以及相关 React 组合组件与 Rain CSS。没有修改 HeroUI 核心源码。

本记录中的“源码检查”表示检查实际选择器和变量消费关系；不等于每一个组件都完成了真实输入操作或视觉验收。本子任务新增并运行了下方 Picker / 表格容器圆角测试与表单 CSS 状态表；真实 React 组件交互检查由整体审计另行汇总。

## 覆盖的组件族和状态

| 组件族 | 已检查的源码状态与主题关系 |
| --- | --- |
| Input / TextArea / TextField | primary / secondary；默认、hover、focus、invalid、invalid + focus、disabled；共享 field 颜色、6px 圆角；TextField 错误时隐藏 description 的逻辑保持 |
| InputGroup / NumberField / SearchField | 组级 hover / focus-within / invalid / disabled；前后缀；增减按钮 pressed / disabled；自动填充颜色；secondary 变体 |
| InputOTP | slot 默认、hover、active、filled、invalid、disabled；caret 与 separator；secondary 变体；原动画保持 |
| Select / Autocomplete / ComboBox | trigger / input 默认、hover、focus-visible、invalid、disabled；placeholder、clear-button、展开 indicator；popover 主题消费和进入退出样式 |
| Checkbox / CheckboxGroup | 默认、selected、indeterminate、hover、pressed、focus-visible、invalid 与选中组合、disabled；primary / secondary |
| Radio / RadioGroup | 默认、selected、pressed、focus-visible、invalid 与选中组合、disabled；secondary control 及内部 indicator；圆形形状保持 |
| Switch / SwitchGroup | 默认、hover、pressed、selected、selected + hover / pressed、focus-visible、disabled 与选中组合；sm / md / lg；thumb 位置和过渡保持 |
| DateField / TimeField / DateInputGroup | 分段默认、placeholder、focused、invalid、invalid + focused、disabled；prefix / suffix；primary / secondary |
| DatePicker / DateRangePicker | trigger focus / disabled；popover 默认与进入退出；范围分隔符；发现并修复面板圆角映射遗漏 |
| Calendar / RangeCalendar | today、selected、pressed、hover、focus-visible、outside-month、unavailable、disabled、readonly、range 中段与端点；日期形状保持 |
| Slider | 默认、selected fill、focus-visible、dragging、disabled；水平 / 垂直；thumb 形状和位置保持 |
| ColorField / ColorInputGroup | 默认、hover、focus-within、invalid、disabled、placeholder；primary / secondary |
| ColorArea / ColorSlider / ColorSwatch / ColorSwatchPicker / ColorPicker | 焦点、拖动、禁用、选中；颜色内容是数据而非品牌色；原透明棋盘格、白色描边不换色；发现并修复 ColorPicker 面板圆角遗漏 |
| Form / Fieldset / Label / Description / FieldError | Form 直接转发 React Aria；fieldset 组装不变；label required / invalid / disabled；description 与 error 的主题前景和可见性 |

## 修复：三个专用 Picker 面板保留了 20px 圆角

原版 `.date-picker__popover`、`.date-range-picker__popover`、`.color-picker__popover` 使用 `min(32px, calc(var(--radius) * 2.5))`。Rain 为了保留圆形和胶囊不修改基础 `--radius=8px`，导致这三个面板仍为 20px；其他常见 Popover 已通过 `--radius-3xl` 映射到 16px。20px 不在现有雨课堂已确认的圆角档位内。

修复只在 `:root[data-rain-theme="light"]` 下选择上述三个 BEM 类，将 `border-radius` 映射到 `min(32px, var(--radius-3xl))`。没有调整面板子元素的基础 radius、间距、阴影、动画、状态选择器或交互。

回归：最初的 `scripts/rain/picker-radius.test.mjs`（随后扩展并改名为 `scripts/rain/container-radius.test.mjs`）编译真实 `@heroui/styles` + Tailwind，并在 Chromium 中测量 CSS fixture。它使用源码对应的 BEM / data-slot，未用模拟 CSS 替代。

- 红灯证据：`picker-radius-red.log`，4 项中 3 项失败，三个面板均实测 20px 而期望 16px。
- 绿灯证据：`picker-radius-green.log`，新增 4 项与原主题 3 项合计 7/7 通过。
- 新增检查保护：原版 light / dark 导入无影响、切回原版完全恢复；Rain 三个面板 16px；嵌套 Radio / Avatar / Button / Switch 的圆形和胶囊不受影响；padding、gap、border width、shadow、overflow、opacity、pointer events、animation / transition 配置不变。

### 复查补充：Primary Table 外壳

全库审查复核发现 `.table-root--primary` 同样直接使用 `min(32px, calc(var(--radius) * 2.5))`，所以 Rain 仍为 20px；内部单元格已映射到 12px。现将它加入上述精确容器选择器，外壳映射为 16px，恢复原版外壳与内部圆角相差 4px 的关系。Secondary Table 的外壳及 body 四角仍为原版 0px，不新增圆角。

- 红灯证据：`table-radius-red.log`，新增 primary case 实测 20px 而期望 16px；其余 5 项通过。
- 最终回归：`container-radius-green.log`，容器 6 项与原主题 3 项合计 9 项。此日志取代早期 7 项结果作为当前容器修复的验证依据。
- 此次补查遍历了全库 85 份组件 CSS 的直接 border-radius 定义。未映射的 `tabs__list-container` 20px 是水平分段器 40px 高的胶囊外壳，按原版形状保留原则不改；ColorSlider 的 999px 是轨道端帽，同样保留。其他直接引用 `--radius-xl/2xl/3xl` 的容器已由主题 token 覆盖；原版 inline utility 规则继续保留。

## 保留的原版表现，未当作换肤错误修改

1. **Checkbox / Radio / Switch 直属 FieldError 使用 muted。** `field-error.css` 和各 wrapper 明确覆盖为 `text-muted`，不是 Rain 把错误文字“变灰”。普通 FieldError 仍是 danger，invalid label 仍是 danger。若未来要统一红色，需要另行评估原组件视觉，当前不改。
2. **Radio 的 invalid + selected 仍为 accent 填充加 danger outline / ring。** 不自行改成红色填充，保留 HeroUI 的错误与选中组合。
3. **部分组级输入的 invalid border 变量未定义。** InputGroup / NumberField / SearchField / DateInputGroup / ColorInputGroup 引用了 `--color-field-border-invalid`，而默认主题未声明；但 `status-invalid-field` 已通过 danger outline / ring 表示错误，且原 field border width 为 0。该源码情况原版已有，不增加 Rain 专属变量掩盖上游差异。
4. **disabled 依旧使用透明度。** 部分嵌套描述或 label 还叠加透明度，这是原选择器行为。主题不将其改写成统一禁用灰色，也不强行按正常文字对比度衡量禁用内容。
5. **颜色编辑器内的任意颜色、透明棋盘格、白色边框属于数据展示。** 不把这些内容强制染成品牌蓝。
6. **DateInputGroup 的 invalid + focused 保留普通焦点环与错误描边。** 实测 `data-focus-within` 与 `data-invalid` 同时成立时，原版带 `:not(:has(trigger))` 的 focus 选择器优先级更高，环继续使用 focus，outline 使用 danger。状态表明确保护这项上游表现；不把它误修成组件行为变化。

## 表单 CSS 状态表验证

`scripts/rain/forms-state.test.mjs` 编译真实 Tailwind / HeroUI CSS，在 Chromium 中运行 168 个源码匹配的 data-state 样本：116 个输入框/组/选择控件变体与状态、47 个 Checkbox / Radio / Switch 状态、5 个日期分段状态。它覆盖默认、hover、focus、disabled、invalid、invalid + focused；复选框另含 selected、indeterminate、invalid + selected / indeterminate，切换控件包含 selected + hovered / disabled。

InputGroup 的原版焦点规则依赖 `:has(input:focus)`，没有等效的 data-focus 标记，因此它的 4 个 primary / secondary × normal / invalid 组合使用原生 DOM focus 另测；没有伪造一个源码不存在的选择器。其他状态使用 data 属性及对应 pseudo-element，比对的是 CSS 状态表达，不冒充 React Aria 用户输入测试。

结果：`forms-css-tests.log` 的 3 个测试全部通过；详细计算样式和范围存于 `forms-css-states.json`。验证内容包括：

- 原版 light / dark 导入主题 CSS 无影响，启用 Rain 后切回计算样式恢复。
- Rain 各输入 field 圆角 6px；普通 focus、错误 outline / ring、selected 背景与 indicator 前景消费正确角色。
- default 与 hover 背景可区分；disabled 透明度与 pointer-events 保持；日期分段的 focused / invalid 前景和填充正确。
- 高度、padding、gap、字号/行高/字重、border width、outline 几何、阴影层几何、过渡/动画、transform / scale 不变；Checkbox / Radio / Switch 的控制器及 pseudo-element 形状保持原版。

没有在这一阶段修改额外主题 CSS；实际用户键盘/鼠标、portal、焦点恢复由真实 React 浏览器套件覆盖，不能用这 168 个 CSS 样本数量替代真实组件交互覆盖率。

## 已确认实色角色对比度

以下为已映射色值的 sRGB 相对亮度计算，不包含半透明合成、抗锯齿或动画中间帧，不代表全组件无障碍认证。

| 前景 / 背景 | 比值 |
| --- | ---: |
| 正文 `#14233C` / field `#FFFFFF` | 15.726:1 |
| 正文 `#14233C` / secondary `#EDF3FA` | 14.079:1 |
| placeholder `#56688F` / field `#FFFFFF` | 5.567:1 |
| placeholder `#56688F` / secondary `#EDF3FA` | 4.984:1 |
| selected indicator `#FFFFFF` / accent `#1561F8` | 5.125:1 |
| selected indicator `#FFFFFF` / accent-hover `#0F52DC` | 6.440:1 |
| error `#B52A36` / field `#FFFFFF` | 6.270:1 |
| error `#B52A36` / secondary `#EDF3FA` | 5.614:1 |
| date focused segment `#0F55DF` / `#EAF2FF` | 5.507:1 |
| focus ring `#3D7BFF` / white | 3.835:1 |
| focus ring `#3D7BFF` / page `#F2F4FF` | 3.499:1 |
| focus ring `#3D7BFF` / secondary `#EDF3FA` | 3.434:1 |

## 建议纳入整体运行时回归

- 用真实 Tab / 输入触发 focus 与 invalid + focus，确认蓝色普通焦点和红色错误焦点，不能只断言 root token。
- 检查 disabled 控件跳过焦点、不会触发回调；secondary 控件 hover / focus 的背景角色正确。
- 日期分段通过键盘改变数值、选中日期、关闭面板并恢复焦点；日历 selected / today / range 端点保留原版圆形。
- Select / Autocomplete / ComboBox 的 portal 从 html 继承雨课堂主题，placeholder / 选项 / 选中标记与错误状态可区分。
- 字体切换允许自然字形宽度变化；不应把平台没有 PingFang / LINE Seed 字体文件误报为主题加载失败，当前未分发字体二进制。

# 雨课堂主题全库状态检查

日期：2026-10-19。基线仍为 HeroUI v3.2.6。本轮检查并修复雨课堂换肤问题，保持原版组件结构、尺寸、布局、阴影、状态机制和交互。

> 本页为当日历史快照。此后用户已确认按钮 10px 圆角、列表选中浅底和更浅提示色，详见 [视觉反馈](visual-feedback-2026-10-19.md)；2026-10-20 的输入遗漏修复及定向复查见 [第一批视觉复查](visual-review-batch-1-2026-10-20.md)。下文“保留原版”中的按钮／列表描述不作为当前主题规则。

## 已修复

1. **成功／警告浅色状态文案的可读性。** 第一版将 soft 文案直接映射为实体状态色。警告标签叠在雨课堂页面底色上只有 4.29:1，另有成功／警告的浅底与 hover 组合不足 4.5:1。移除这两个覆盖，让 HeroUI 原有 `color-mix` 配方从已确认状态色与正文色派生。实体品牌色、浅底透明度、hover 机制不变。成功／警告在所测四种表面与两种浅底状态中的最低值为 6.75:1 / 6.86:1；全部 32 个状态色／表面组合达到 4.5:1。
2. **四处容器圆角漏映射。** DatePicker、DateRangePicker、ColorPicker 浮层及 Primary Table 外壳直接使用基准半径的 2.5 倍，第一版仍为 20px。仅在 Rain 根作用域下将四个精确类映射到 16px。Secondary Table 保持原样；原版 light/dark、圆形头像、Radio、Button／Switch／Tabs 胶囊均不受影响。

产品修复集中在 `packages/rain-theme/index.css`；没有改动 `packages/react`、`packages/styles` 的受控文件，也没有修改旧雨课堂库。12 份品牌来源摘要仍匹配，第三方 lockfile 解析记录不变。

## 检查范围与结果

证据目录：`evidence/runtime/rain-theme-state-audit-2026-10-19/`。

| 层级                  | 覆盖                                                                                               | 结果／证据                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 全库源码审查          | 表单、列表／集合、卡片、导航、浮层的 token 和状态消费；85 份组件 CSS 的直接圆角计算检查            | `forms-source-audit.md`、`collections-source-audit.md`、`overlays-source-audit.md`           |
| 全量初始渲染          | 587 个 stories、72 个分组；包含 100 个带禁用节点、12 个带错误节点的故事                            | **587/587**，Rain 根标记／主色、实际渲染、可见错误页和未捕获脚本错误检查；`story-smoke.json` |
| 真实 React 浏览器交互 | 47 项未修改的上游测试注入真实 Rain CSS，另加 4 项表单／复选／列表／卡片专项                        | **51/51**，`final-react-interactions.log`                                                    |
| 真实编译 CSS 回归     | 原主题隔离＋容器圆角＋表单＋集合＋浮层                                                             | **19/19**，`final-css-tests.log`                                                             |
| 表单 CSS 状态         | 168 个样本；InputGroup 另有 4 组原生焦点组合                                                       | `forms-css-states.json`、表单审查报告                                                        |
| 集合 CSS 状态         | 93 个样本，另检查 32 个 soft 色／表面／hover 组合                                                  | `collections-computed.json`、`collections-status-contrast.json`、集合审查报告                |
| 浮层 CSS 状态         | 39 组记录、83 个元素／状态对照                                                                     | `overlay-css-states.json`                                                                    |
| 工程检查              | Storybook 类型检查；新增脚本与浏览器测试 lint、格式检查；Git diff whitespace                       | 通过，相应日志与 `source-and-coverage.json`                                                  |
| 文档站实际界面        | DatePicker 浮层白底、正文色、中文字体、16px 圆角；Esc 关闭后焦点回到日历触发器；Rain→原版深色→Rain | 应用内浏览器确认，`docs-datepicker-rain.png`                                                 |
| Storybook 实际界面    | Chip 三种尺寸及各颜色、primary/secondary/tertiary/soft 变体在 Rain 下显示                          | `storybook-status-chips-rain.png`                                                            |

CSS 状态样本按照上游实际 class／data 属性构造，覆盖真实样式规则，不冒充 React 事件测试。真实 React 套件负责输入、Tab 路径、禁用跳过、只读不改值、错误＋聚焦、复选选择、列表跳过禁用项及选中标记；上游套件覆盖 Select／Dropdown 等组件的特定交互、Autocomplete 的 Tag 删除、Modal／AlertDialog／Drawer 的焦点与滚动锁定，以及 Popover／Tooltip／Toast 等既有测试路径。P5 整理时澄清：本次 Autocomplete 浏览器用例不包含其键盘导航，不能从同族或套件名称推断具体覆盖；历史 51 项计数保持原样，本轮没有重新运行。

| 组件族                                                        | 默认                       | 悬停                  | 聚焦                                           | 禁用                   | 错误／选中等组合                                      |
| ------------------------------------------------------------- | -------------------------- | --------------------- | ---------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| Input、TextArea、输入组合、数字／搜索／颜色／日期字段         | CSS＋React 抽样            | CSS＋真实指针抽样     | CSS＋真实键盘／原生焦点                        | CSS＋跳过／只读检查    | invalid、invalid+focus；日期分段                      |
| Checkbox、Radio、Switch                                       | CSS                        | CSS                   | CSS                                            | CSS；Checkbox 实际禁用 | selected、invalid、invalid+selected；伪元素和圆形保护 |
| Select、ComboBox、Autocomplete                                | CSS＋全 story 渲染         | CSS                   | CSS；Select 真实键盘，Autocomplete 仅 Tag 删除 | CSS＋对应 stories      | 原版支持的 invalid 规则、选项／清除／关闭             |
| ListBox、Menu、Tag、Table、Tabs、导航                         | CSS＋全 story 渲染         | CSS                   | CSS；列表真实键盘                              | CSS；列表跳过禁用      | 选中标记、Table 行、错误 Tag 等适用状态               |
| Card／Surface                                                 | 四类 surface 与组合故事    | 容器本身无 hover 状态 | 由内部控件负责                                 | 容器本身无禁用状态     | 容器本身无错误状态；不额外发明                        |
| Modal、AlertDialog、Drawer、Popover、Tooltip、Dropdown、Toast | 容器／箭头／状态内容／遮罩 | 触发器及关闭控件      | CSS＋上游实际焦点行为                          | 适用触发器／关闭控件   | 进入退出、四向 Drawer、嵌套内容状态                   |

比较原版与 Rain 时，允许颜色、字体族与已声明圆角变化；检查高度、padding、gap、字号、行高、字重、边框宽度、禁用透明度、焦点环几何、阴影结构、过渡／动画与点击规则保持。焦点环也是 box-shadow，比较时允许其颜色变化，不将整个 shadow 字符串错误地当作不变量。

## 保留的原版表现

- ListBox／Menu 选中本来主要通过勾选或圆点表达，没有擅自增加品牌选中底色。Card 也没有新增 hover、disabled、invalid 行为。
- Checkbox／Radio／Switch 的部分 FieldError 文字原版采用 muted；Radio 错误＋选中仍可保持品牌填充配错误边界；DateInputGroup 错误＋聚焦组合保留原版蓝色 ring＋红色 outline。没有为统一视觉而改写这些规则。
- Tabs 悬停时整体 opacity 为 0.7，合成后的文字对比度在原版和 Rain 中都有不足；这是保留的上游机制，本轮不声称全库可访问性认证通过。
- Table 的原版 hover／selected 公式叠在较接近白色的雨课堂 secondary 表面上时，底色变化较淡；保留已确认表面色与原版公式，勾选、焦点标记仍在。未增加一套新的列表交互视觉。
- 自定义样式示例、颜色教学色板、图片、外部内容继续使用自身内容，不强行改写全部像素。

## 复查入口

- [中文组合对照](http://127.0.0.1:6006/?path=/story/components-theme-brand-comparison--comparison&globals=heroui-theme:rain-light)
- [状态标签变体](http://127.0.0.1:6006/?path=/story/components-data-display-chip--variants&globals=heroui-theme:rain-light)
- [输入错误态](http://127.0.0.1:6006/?path=/story/components-forms-textfield--invalid&globals=heroui-theme:rain-light)
- [含禁用项的列表](http://127.0.0.1:6006/?path=/story/components-collections-listbox--with-disabled-items&globals=heroui-theme:rain-light)
- [中文 DatePicker 文档](http://127.0.0.1:3100/cn/docs/react/components/date-picker)

以下为 19 日历史命令，不在当前 P5 准备轮执行。扫描入口现已要求新输出目录；只查看配置的用法见 [P5 工具准备](p5-scan-preflight.md)。

```sh
node --test scripts/rain/theme.test.mjs scripts/rain/container-radius.test.mjs scripts/rain/forms-state.test.mjs scripts/rain/collection-state.test.mjs scripts/rain/overlay-state.test.mjs
pnpm exec vitest run --config scripts/rain/browser.vitest.config.mts --no-file-parallelism
# 当日扫描使用 node scripts/rain/story-smoke.mjs；当前不带 --output 会被拒绝
```

最终通过记录以 `final-*` 日志为准。早期调试包含错误断言读取隐藏错误提示、复选框主节点代替伪元素、指针位置未复位，以及 CSS 热更新时测试 iframe 被替换；这些是测试修正过程，不据此修改原版组件。

本轮是全量渲染与重点状态回归，不代表对 587 个故事的每条业务路径逐一人工验收。仍未完成 Safari／移动设备／VoiceOver、全部响应式尺寸及所有自定义样式组合验收；没有提交、推送或发布。

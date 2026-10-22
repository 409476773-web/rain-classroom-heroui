# P5 后续定向复查与交付核对

2026-10-21：按顺序补查表单／选择器、菜单／浮层、日期／Slider、导航／颜色、反馈／媒体，处理历史文档引用，再核对 r2 的 JavaScript 入口。**本轮可在现有限制内执行的工作已完成，P5 整体仍未通过。** 没有运行重测试、全 story 扫描、依赖安装或生产构建。

上游仍为 HeroUI 3.2.6，Rain Theme 0.1.2；保留已确认的颜色、字体和 10px 按钮圆角。浏览器为本机应用内浏览器，没有据此声明其他浏览器、读屏或真实触控通过。

## 本轮改动

1. **Storybook 正文颜色继承。** [globals.css](../../packages/storybook/.storybook/globals.css) 增加 Rain 限定的 `body { color: var(--foreground) }`。Popover 的裸标题／正文，以及 Autocomplete／ComboBox 中直接作为选项内容的文字，原先实际继承黑色；现在继承 `#14233C`，同时覆盖 body portal。文档站已有 Fumadocs 正文色绑定。未改组件实现、品牌 token、交互或 r2 归档。
2. **三处历史发布文档。** 中英文 alpha.34 的 `text-field-basic` 改为已注册的 `textfield-basic`；中文 v3.0.4 的 `text-typography-scale` 改为 `typography-typography-scale`，该节过期的 `Text` 名称对齐同版英文的 `Typography`。没有新增重复 demo 或别名。[静态语义与差异证据](../../evidence/reviews/rain-p5-release-refs-2026-10-21/README.md)。
3. **清单和验收记录同步。** 生成资料仍为 87 模块、每语言 681 示例；引用问题从 12 条降为 9 条，剩余都是尚未生产重建的 story 差额。4 个未直接注册中文文件继续保留原分类。

## 实际执行范围

证据目录：[rain-p5-followup-2026-10-21-r1](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/)。51 个选定 story 包含真实操作与被动样式／语义观察，两类不混称为全状态交互通过。另对既有 Fields、Layouts 指定节点采样对比度，并打开三份历史发布页面。

| 组                                                                             | 实际观察／操作                                                                                                                        | 没有据此覆盖                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Switch／SwitchGroup、CheckboxGroup／RadioGroup                                 | Space 开关、组内独立值；空提交必填错误、选择后恢复；多选保留其他值；单选方向键；选中禁用与整组禁用标记                                | 全部变体、触控、所有 hover／pressed／组合                                                         |
| Autocomplete／ComboBox                                                         | 搜索、无结果、清除、方向键跳过 Cat／Kangaroo、选择 Bird；ComboBox 过滤 Elephant；浮层裸文字颜色；Esc 后最终关闭与焦点记录             | 异步／虚拟列表、多选、所有错误／只读；Autocomplete 的回焦点有下列限制                             |
| InputOTP                                                                       | 六位输入、错误提交、左右／退格、槽位错误标记撤销、6px 槽、禁用样本                                                                    | 成功 alert／真实验证码服务；错误文案有下列原版示例限制                                            |
| Dropdown／Popover／Tooltip／AlertDialog                                        | 菜单键盘打开、End、Esc；Popover Enter 打开、Esc 回触发器；Tooltip 键盘显示、Esc；AlertDialog Tab 约束、默认 Esc 保持、Cancel 回触发器 | 子菜单、嵌套、滚动、指针移入 Tooltip、全部状态变体；默认禁止 Esc 是原版机制                       |
| DateField／TimeField／DateRangePicker                                          | 2026-10-20 错误→21 日恢复；08:00 错误→09:00 恢复；范围终日 25→26、受控摘要、日历打开／Esc 回触发器；日期／时间禁用分段                | 全部边界、只读、范围网格重新选两端；内部年份焦点限制未解决                                        |
| Slider                                                                         | 双端 100／500→150／450、下端 End 停在上端 450；纵向 30→31；禁用 30                                                                    | 真实拖动、触控、全部方向与尺寸                                                                    |
| Accordion／Disclosure／DisclosureGroup、Pagination／Toolbar／Link／Breadcrumbs | 双展开后独立关闭；展开收起、禁用；单展开切换；分页 1→2→12、首尾禁用及摘要；工具栏 Space／向右方向键；Link 禁用跳过、Breadcrumb 禁用   | Toolbar End 没有移焦，不记通过；其余方向、所有导航方式、窄区／长中文未补齐                        |
| ColorPicker／Area／Slider／Field／SwatchPicker                                 | 二维／色相键盘、hsl→rgb、red 编辑、Esc 回触发器；固定错误和禁用；alpha 0→100%；色板选择后摘要 `#D946EF`                               | 所有数据色、真实拖动、只读、完整色彩模型；不把色值改为品牌色                                      |
| Alert、Meter、ProgressBar／Circle、Spinner／Skeleton、Avatar／Group            | 状态色观察；750／1000 语义；不确定进度不暴露假百分比；动画名称；回退／状态色和 max3／+2                                               | 被动观察不是交互通过；Avatar 坏地址延迟 NA 未单独等待，外部资源可用性未全查；未验证全部动画／缩放 |

Popover 修复前后有实际可见 H2／P 证据；原版 Light／Dark 各 3 个节点的所取颜色和字体恢复一致，不扩大为本轮所有入口的完整几何或主题对照。Autocomplete／ComboBox 修复后六个直接文字选项均为 `#14233C`；Tooltip 正文同样继承 Rain。

部分立即关闭快照的 `innerText` 仍含退出动画内容，不能据此判定关闭失败。Autocomplete／ComboBox、Popover／Tooltip、AlertDialog、日期范围最终关闭结果使用浮层隐藏等待后的记录；Accordion／Disclosure 使用 `aria-expanded`。选择器定位失败的几次工具操作没有作为组件失败或通过计数。没有逐入口采集完整脚本错误；保留的控制台样本有 2 条 React 开发诊断（内部按钮组属性、value/defaultValue 同传），尚未逐入口归因，不声称控制台零错误。

## 发现并保留的限制

- **当前浅文字对比度。** [21 个当前 DOM 样本的计算](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/contrast-calculation.json)：placeholder 在白底为 **2.282:1**、次级底为 **2.043:1**；12px／500 表头在 `#EBEFFF` 上为 **3.236:1**。均低于普通文字 AA 的 4.5:1。保留用户确认的浅色，不自动改色；不能宣称完整对比度通过。这里只计算选定非禁用节点，未覆盖所有合成／交互状态。
- **P5-I14：OTP 原版示例文案残留。** 错误后编辑，6 个槽位 `data-invalid` 撤销，但示例的普通 span 输出 `data-visible="false"`，仍命中属性存在样式，错误文字保持可见。原版 Light 同样出现；源码与上游 HEAD 一致。没有改 InputOTP、共享错误样式或原版示例交互。
- **P5-I15：Autocomplete 原版同现关闭焦点限制。** 此处只验证“指针点开触发区域→搜索框 Esc→浮层消失”：原版 Light／Dark 和 Rain 均落到 BODY。未修交互，不记作触发器焦点恢复通过，也不扩展到键盘打开或其他选择模式。
- CalendarYearPicker 的既有隐藏焦点、Tabs 原生 title／富文本及 hover 对比度限制继续保留。新发现不影响已确认批改页的限定视觉结论。

## 文档与真实交付

三份 release 页面实际渲染 **9＋9＋1＝19 个预览**，没有未注册 demo 提示；中文／英文 TextField 分别展示对应语言邮箱输入，Typography 比例样本有 10 个排版节点。证据为目录中的 `release-*.json`，I06 可按这三处引用范围关闭，其他历史链接和页面不由此推导。

[r2 入口核对](../../evidence/reviews/rain-p5-r2-imports-2026-10-21/README.md)从原真实解包消费者串行 `import()`：**React 87、Styles 85，共 172／172 成功**；Theme 仅 CSS，不计 JS 入口。三个包共 1,203 文件与归档逐字节一致，冻结交付 23 文件未变。第三方依赖复用本机安装；没有全新安装、独立 CJS、RSC、全部行为或生产就绪结论。I09 的全 JS 入口子项已有结果，新环境安装仍待。

[53 项证据断言](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/evidence-checks.json)核对已保存浏览器观察，不是 53 个组件测试或又一次浏览器运行。静态目录、文档链接、格式和受保护输入核对的最终结果见本目录的 `closeout.json`。

## 下一阶段与关闭条件

| 顺序                               | 当前状态                   | 还需完成                                                                                            |
| ---------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| 当前允许的定向复查／文档／入口核对 | 本轮指定范围已执行并记账   | 未覆盖状态仍在 87 模块矩阵；不以 51 个入口概括全部状态                                              |
| 已确认浅色与原版已知限制           | 已量化／有复现，保持原实现 | 若要求修复 I01／I14／I15 或改变已确认色值，先明确该项设计／行为目标；不能把保留记录当作用户批准例外 |
| P5 当前完整回归与生产产物          | 受当前约束暂缓             | 冻结隔离候选，运行当前测试／构建／真实扫描，核对 596 源码 stories 与实际生产索引；保留旧证据        |
| 新环境、平台与辅助技术             | 待安排                     | 全新依赖安装、目标浏览器／读屏／触控及剩余适用状态；NodeNext／完整离线按目标范围另定                |
| P5 最终收口                        | 尚未达到                   | 汇总上述实际结果、用户限定视觉确认、保留例外与交付身份后再给对应范围结论；不自动发布或迁移业务      |

原计划为 P0–P5，当前没有新增一个已授权的 P6。P5 后可单独安排真实业务试点与 AI 组合流程，但不在本轮自动建设新产品功能。

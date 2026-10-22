# P5 近期改动组件定向复查 Implementation Plan

2026-10-20 执行回填：用户已安排本批定向复查，9 个指定入口及文档 Tabs 指定节点的实际结果见[复查报告](p5-focused-review-2026-10-20.md)。已修复 1 处 Storybook 宿主字体继承；下文保留编制时的步骤与停止边界，不再表示本批尚未开始。没有启动重测试、全库扫描或生产构建，未覆盖的模式仍按报告记账。

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为下一批按钮、输入、列表／Select、Table／Tabs 的定向复查准备可复现步骤，重点验证近期换肤与原版隔离。

**Architecture:** 复用已有四个集中复查样本，仅补充五个现有上游 story；不创建故事、包装组件或第二套状态实现。文档入口用于核对当前 API；Storybook 的真实操作、计算样式和焦点记录分别保存，不用静态目录替代运行证据。

**Tech Stack:** HeroUI 上游 3.2.6 / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`，React 19、Tailwind 4；当前私有 r2 React／Styles `3.2.6-rain.1`、Rain Theme `0.1.2`。

---

## 编制时只做准备（历史）

2026-10-20：**本页是下一批操作计划，全部步骤尚未在本轮执行，不是检查通过证明。** 本轮仅阅读现有 catalog、inventory、样本及相关实现并创建本文；不操作浏览器，不运行测试、扫描、生成器、依赖安装或构建。P5-I13 的工具准备另行记账，工具准备完成不代表已执行本页或全库扫描。

下一次只有在明确安排该批定向复查后，才操作下面的有限页面。重测试、全 story 扫描与生产构建仍暂缓；本文不解除该约束，也不授权改已确认颜色、原版交互、批改页、提交、发布或其他项目迁移。当前源码 596 个 story exports 与历史生产索引 587 个 stories 的差额继续保留。

来源：[结构化目录](../../apps/docs/src/generated/rain-catalog.json)、[清单](inventory.json)、[模块矩阵](p5-component-matrix.md)、[遗留台账](p5-open-issues.md)。下列 ID 来自已有索引／复查记录和对应 story 导出；本轮没有重新请求开发索引，也没有验证服务当前是否运行。默认地址为 Storybook `http://127.0.0.1:6006/`、文档站 `http://127.0.0.1:3100/`；端口变化按实际启动器输出替换，不为执行计划结束未知进程。

## 四组共用的执行与留证规则

1. **先记录候选。** 保存实际时间、上游提交、两份 Tabs 补丁、主题 CSS／lockfile 摘要、服务所用 workspace／版本、浏览器版本、视口和主题全局值。workspace Storybook 与 r2 的 6008 解包消费者分别记账；本批默认检查前者，不把其成功记成新的包消费结果。
2. **使用全新证据目录。** 后续执行时选择 `evidence/runtime/rain-p5-focused-<唯一运行标识>/`，目录已存在就另选，不覆盖任何历史记录。建议四个子目录为 `buttons/`、`fields/`、`selections/`、`table-tabs/`；本轮没有创建这些目录或证据。每组记录执行／未执行／中断，未取到的数据不能补写成成功。
3. **逐组做相同主题往返。** 在同一 story、同一视口和同一初始状态下，依次取原版 Light、原版 Dark、Rain Light，再恢复原版 Light／Dark 的记录。用顶部已有主题菜单切换，对应 globals 为 `light`、`dark`、`rain-light`。必要时重新挂载该 story 复位本地状态，并记录复位；不能把主题切换误认为自动清空状态。两主题并排必须使用独立 iframe。
4. **核对真正的预览根。** 记录 story ID／URL 和 preview iframe 的 html：Rain 应有 `data-rain-theme="light"` 且为亮色；原版应移除该标记并恢复对应明暗模式。Select portal 同时取实际浮层节点。先把指针移开再记录默认值，焦点／关闭动画稳定后再读取结果。
5. **先保留原版机制，再比视觉。** 允许已确认的颜色、字体族、圆角及普通 Tabs 名称例外。对所取节点比较高度、padding、gap、字号／行高、字重、边框宽度、禁用透明度、焦点环几何及原版动画机制；阴影允许颜色随主题改变，不能把整个 shadow 字符串当作不变量。字体改变造成的文字固有宽度与已授权 Tabs 截断宽度单独解释。
6. **只用真实操作造状态。** 用实际指针、Tab／方向键、Space／Enter、输入和点击；不注入 `data-hovered`／`data-selected` 等属性代替事件，不加临时 inline 样式。不把截图、CSS 值、DOM 名称和键盘结果合并成一个“全通过”。
7. **每组最小证据。** 保存 `scope.json`（候选、URL／ID、环境、实际节点／操作清单）、`original-light-before.json`、`original-dark-before.json`、`rain-states.json`、`original-restored.json` 及必要截图。JSON 至少含节点可访问名称／角色、状态、实际值／选择、activeElement、所取计算样式和失败描述；恢复记录分别列 Light／Dark。几何比较只列实际取过的属性和节点，不继承旧节点数量。

## 第一组：Button／ButtonGroup／ToggleButton／ToggleButtonGroup

**现有样本：** [按钮与按钮组](http://127.0.0.1:6006/?path=/story/components-theme-state-review--buttons&globals=heroui-theme:rain-light)，ID `components-theme-state-review--buttons`，导出 `Buttons`；[样本源码](../../packages/storybook/.storybook/stories/rain-state-review-buttons.stories.tsx)。

**文档入口：** [Button](http://127.0.0.1:3100/cn/docs/react/components/button)、[ButtonGroup](http://127.0.0.1:3100/cn/docs/react/components/button-group)、[ToggleButton](http://127.0.0.1:3100/cn/docs/react/components/toggle-button)、[ToggleButtonGroup](http://127.0.0.1:3100/cn/docs/react/components/toggle-button-group)。

| 步骤                      | 实际操作                                                                                          | 要核对的机制与结果                                                                                                                                           | 要保存的证据                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1. 尺寸与默认态           | 查看“尺寸与图标按钮”的 sm／md／lg 普通、图标、切换按钮；再看 primary／secondary／tertiary／danger | Rain 独立 Button／ToggleButton 为 10px；尺寸／图标布局和变体机制沿原版。不要求各尺寸高度相同                                                                 | 每尺寸各类节点的几何／圆角、变体默认色及全页截图                |
| 2. hover／pressed         | 将指针依次移入主要、次要、第三、危险按钮；按住再释放，移开                                        | 主按钮 Rain hover 对应现有 `#0F52DC`；危险语义保留。单按钮按压与组内禁止缩放的原版规则分别记录；按钮夹具没有业务结果计数                                     | 默认／hover／pressed／释放后样式、按钮状态，不制造回调次数      |
| 3. 键盘与单个 Toggle      | 用 Tab 到普通／图标按钮和“未选中切换”；Space 切换，再操作“已选中切换”“已选中透明切换”             | 焦点可见、完整名称与选择状态保留；禁用普通／危险／切换及“已选中且禁用”均不被操作。不要只凭颜色判断 selected                                                  | Tab 路径、activeElement、`aria-pressed`／选择状态，禁用前后对照 |
| 4. 连接 ButtonGroup       | 检查三尺寸横向组、纵向组、RTL 组、单项组；用 Tab 逐项聚焦；查看禁用组                             | 仅外缘 10px、内部连接直角；纵向／RTL 逻辑边和分隔线保留。普通 ButtonGroup 是一组普通按钮，不能要求它表现成方向键选择控件                                     | 四角半径、分隔线与焦点截图，禁用组焦点路径                      |
| 5. 连接 ToggleButtonGroup | 在“md 连接切换按钮”、纵向及 RTL 切换组内用方向键移动，再用 Space；记录实际选择                    | 初始第二项被选；沿原版方向与 roving focus／选择模式，不自行规定“方向键一定选中”或“单选不得为空”。组内焦点环沿原版 inset，不能统一改成普通 ButtonGroup 的外环 | 操作前后 focused／selected 项、RTL／纵向路径、焦点环及连接边    |
| 6. detached 与单项／禁用  | 在“分离切换按钮”选择第二项，再取消一项；检查“单项切换按钮组”和禁用切换组                          | detached 每项完整 10px、保留间距且无连接分隔线；多选按原版可分别切换，禁用组保持既有选择                                                                     | 多选集合前后、圆角／gap、单项和禁用截图                         |
| 7. 原版恢复               | 按共用规则恢复 Light／Dark，在同名节点重取默认／焦点／选中状态                                    | Rain 的 10px 覆盖不残留；颜色、圆角和原版选择机制恢复。宽度比较注明字体差异                                                                                  | `original-restored.json` 和原版恢复截图                         |

**本组停止边界：** 不增加加载／链接按钮、CloseButton 或新按钮故事，不更改四族 API，不把没有业务 action 的夹具判为“点击无响应”。本批不扩展到全库 RTL／触控，也不重做已审核批改页。

## 第二组：Input／TextArea／SearchField／NumberField／InputGroup

**主样本：** [输入提示与表单状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--fields&globals=heroui-theme:rain-light)，ID `components-theme-state-review--fields`，导出 `Fields`；[样本源码](../../packages/storybook/.storybook/stories/rain-state-review-fields.stories.tsx)。

**仅补主样本缺少的 InputGroup 状态：** [错误](http://127.0.0.1:6006/?path=/story/components-forms-inputgroup--invalid&globals=heroui-theme:rain-light) `components-forms-inputgroup--invalid`／`Invalid`；[禁用](http://127.0.0.1:6006/?path=/story/components-forms-inputgroup--disabled&globals=heroui-theme:rain-light) `components-forms-inputgroup--disabled`／`Disabled`；均在[原版故事源码](../../packages/react/src/components/input-group/input-group.stories.tsx)。

**文档入口：** [Input](http://127.0.0.1:3100/cn/docs/react/components/input)、[TextArea](http://127.0.0.1:3100/cn/docs/react/components/text-area)、[TextField](http://127.0.0.1:3100/cn/docs/react/components/text-field)、[SearchField](http://127.0.0.1:3100/cn/docs/react/components/search-field)、[NumberField](http://127.0.0.1:3100/cn/docs/react/components/number-field)、[InputGroup](http://127.0.0.1:3100/cn/docs/react/components/input-group)。

| 步骤                      | 实际操作                                                                                                            | 要核对的机制与结果                                                                                                                                                     | 要保存的证据                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. 空值与固定文字         | 从“练习名称空值提示”“反馈空值提示”“学生搜索默认提示”“分数默认提示”取默认／hover；对照标签、说明、固定前后缀         | Rain 真 placeholder 使用 `#A0ACC5`；正文 `#14233C`；辅助说明与 `$`／USD／https://／.com 等持久文字使用现有辅助角色，不随 placeholder 变浅。字段 6px，其他结构沿原版    | 实际 placeholder-bearing 节点清单及伪元素计算色；标签／说明／前后缀另取，勿混计    |
| 2. 输入与清空             | 在默认 Input 输入“课堂复查”，默认 TextArea 输入两行反馈，再清空；对照预填样本                                       | 输入后正文与提示区分，原生文本编辑、换行、光标和字段焦点保留；清空后提示恢复。只读预填项不修改                                                                         | 输入前／后／清空值、焦点、提示色及文字不被裁切截图                                 |
| 3. Search 清除            | 在“学生搜索默认提示”输入“林”，以键盘到实际出现的清除按钮并激活，再重新输入                                          | 清除由现有 SearchField.ClearButton 实现；值清空、提示恢复，记录焦点实际目标；只读样本没有同样清除按钮，不新增                                                          | 清除前后值、按钮是否出现、activeElement、默认与 secondary 对照                     |
| 4. Number 步长与界限      | 在默认评分字段输入 18；通过实际增／减按钮或方向键逐步操作；再检查 0、20 界限；对照只读 18.5                         | 样本明确 min=0、max=20、step=0.5；原版解析、步长、边界按钮与只读守卫保留，不能为颜色复查改校验                                                                         | 18→18.5 等实际路径、0／20 时按钮状态、字段值和焦点                                 |
| 5. 错误／聚焦／禁用／只读 | Tab 到各族可用字段，尝试在只读字段输入，检查禁用项是否跳过；真实聚焦固定错误字段；补看 InputGroup Invalid／Disabled | 错误、focus、disabled opacity 与可编辑性沿原版；InputGroup 错误＋焦点规则不得擅自统一。夹具的 `isInvalid` 为固定属性，输入后错误不必自动消失，也没有提交／纠错业务回路 | Tab 路径、值是否变化、`readOnly`／disabled／invalid、错误＋焦点样式及补充 story ID |
| 6. InputGroup 持久前后缀  | 在金额空值字段输入数值，再清空；比较金额 128 与网址 classroom 预填项；在错误金额项真实聚焦                          | 持久单位一直显示，提示只在空值时出现；正文、前后缀、错误不能被统一成同一浅色。保留现有输入和组合语义                                                                   | prefix／input／suffix 分开取值、颜色、对齐、focus-within 与错误态                  |
| 7. 原版恢复               | 对主样本及两个 InputGroup 补充样本恢复原版 Light／Dark 并重取同名节点                                               | Search／Number 专用 placeholder 和前后缀 Rain 规则均撤销；只读、禁用与固定错误仍按原版样本存在                                                                         | 三个 story 的恢复记录，默认／错误＋焦点对照截图                                    |

**本组停止边界：** 不新增类型／校验 API，不要求静态错误夹具自动纠错，不扩展 OTP、颜色／日期字段、自动填充／IME、全部数字制式或全浏览器。浅提示的对比度只能保存本次实际配色和适用性记录，不能自动改用户确认色或宣称完整无障碍通过。

## 第三组：ListBox／Select

**现有样本：** [列表选中与浮层状态](http://127.0.0.1:6006/?path=/story/components-theme-state-review--selections&globals=heroui-theme:rain-light)，ID `components-theme-state-review--selections`，导出 `Selections`；[样本源码](../../packages/storybook/.storybook/stories/rain-state-review-selections.stories.tsx)。第二组 Fields 已有默认／secondary／禁用／错误 Select，可仅补取对应状态，不增加故事。

**文档入口：** [ListBox](http://127.0.0.1:3100/cn/docs/react/components/list-box)、[Select](http://127.0.0.1:3100/cn/docs/react/components/select)。

| 步骤                  | 实际操作                                                                                           | 要核对的机制与结果                                                                                                   | 要保存的证据                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1. 选中默认／hover    | 查看“单选作答列表”的林同学，指针移入再移开；对照未选陈同学                                         | 普通选中浅底 `#EAF2FF`，选中 hover `#DCE9FF`；勾选、文字、padding／字号及原版 focus 机制保留，不只看底色             | 默认／选中／hover 计算样式、`aria-selected`、指示器及截图          |
| 2. 单选真实键盘       | 以键盘进入单选列表，方向键移到许同学，Space 选择；再点击当前选中项                                 | 原版方向键主要移动焦点、Space 选择；跳过禁用周同学。记录再次点击能否取消，保持实际默认机制，不自行强制“单选不可取消” | 每步 focused／selected、禁用跳过、点击前后集合                     |
| 3. 多选取消           | 查看初始林／陈两项选中的“多选作答列表”；键盘移动到其中一项并 Space，再选择另一可用项               | 仅操作项切换，其余选择保留；禁用项不加入。不能把焦点移动当选择已改变                                                 | 初始／取消／新增后的选择集合和焦点环                               |
| 4. 禁用且选中／危险项 | 查看“特殊选中状态”，尝试操作“已归档作答（禁用且选中）”；对危险选中项 hover／选择                   | 禁用且选中保留原版 0.5 opacity 与守卫；危险项保留危险语义，不强加普通品牌选中底色；操作只改变本地选择，不删除数据    | 禁用与危险节点状态、颜色、透明度和实际操作后集合                   |
| 5. Select portal      | 打开“批改分组选择”；检查初始第一组、已归档禁用项；方向键跳过禁用项，Enter 选第二组；再次打开按 Esc | 触发值更新；浮层继承 html 根主题，选项沿 ListBox 机制；关闭稳定后焦点回触发器。区分 Enter 选择关闭与 Esc 关闭        | trigger 值、真实 portal 样式／根主题、选择与关闭前后 activeElement |
| 6. Select 字段状态    | 回 Fields 的“批改分组默认／次要／禁用／错误提示”及“已选内容”                                       | 空值提示与已选文字可区分；禁用不打开；固定错误可见。不要要求选值后固定 `isInvalid` 自动清除                          | 复用 Fields 的对应记录，避免重复操作与重复计数                     |
| 7. 原版恢复           | 切回原版 Light／Dark，重放同一初始选择并打开 Select                                                | 新增浅品牌选中底不残留，原版指示器／焦点／危险与选择行为恢复；portal 不残留 Rain                                     | 列表与 portal 的恢复数据及关闭后焦点                               |

**本组停止边界：** 不把本组当 Menu／Dropdown／Autocomplete 的覆盖，不扩展分组、虚拟化、异步查询或新的选择模式。不操作真实学生、提交或删除。出现原版同样可复现的问题应分别记已知上游限制，不用故事局部事件掩盖。

## 第四组：Table／Tabs 的最新视觉与原版隔离

**主样本：** [表格、标签页与卡片](http://127.0.0.1:6006/?path=/story/components-theme-state-review--layouts&globals=heroui-theme:rain-light)，ID `components-theme-state-review--layouts`，导出 `Layouts`；[源码](../../packages/storybook/.storybook/stories/rain-state-review-layouts.stories.tsx)及[固定宽度布局](../../packages/storybook/.storybook/stories/rain-state-review-layouts.styles.ts)。本批仅操作其中 Table／Tabs；不重新验收 Card。

**三个既有补充入口：**

| 用途                 | 已有 story ID／链接                                                                                                                                                       | 实际来源与使用边界                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table primary 排序   | [`components-data-display-table--default`](http://127.0.0.1:6006/?path=/story/components-data-display-table--default&globals=heroui-theme:rain-light)                     | [table.stories.tsx](../../packages/react/src/components/table/table.stories.tsx) 的 `Default`；`Custom cells` 表格已有 sortable 列，不存在另造的 sorting story |
| Table secondary 排序 | [`components-data-display-table--secondary-variant`](http://127.0.0.1:6006/?path=/story/components-data-display-table--secondary-variant&globals=heroui-theme:rain-light) | 同文件 `SecondaryVariant`，复用同一排序模板；不由 primary 推 secondary                                                                                         |
| Tabs 短名称          | [`components-navigation-tabs--default`](http://127.0.0.1:6006/?path=/story/components-navigation-tabs--default&globals=heroui-theme:rain-light)                           | [tabs.stories.tsx](../../packages/react/src/components/tabs/tabs.stories.tsx) 的 `Default`；Overview／Analytics／Reports，用于无实际溢出时不加 title           |

**文档入口：** [Table](http://127.0.0.1:3100/cn/docs/react/components/table)、[Tabs](http://127.0.0.1:3100/cn/docs/react/components/tabs)。

| 步骤                      | 实际操作                                                                                               | 要核对的机制与结果                                                                                                                                                                       | 要保存的证据                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1. Table 两变体默认       | 查看 Layouts 的“宽容器表格” primary 与“窄容器表格” secondary                                           | primary 衬底／表头背景与 secondary 表头列使用已确认 `#EBEFFF`；表头默认文字 `#7485A8`，白色表体／正文 `#14233C`。不要求 secondary 整个外壳都染色，不改全局 surface／muted                | 根、header、column、body cell 分开取背景／字色，含继承来源与两变体截图                             |
| 2. Table 选中／禁用／焦点 | 在各表选择陈同学，再用全选；用方向键／Space 观察行选择，尝试禁用周同学                                 | 初始林同学选中；禁用周同学不参与选择且被跳过；页内“已选”反馈与实际集合一致。保持原版 hover／selected 派生公式，不把选中行改成 ListBox 新底色                                             | 原始／新增／全选集合、禁用与焦点位置、hover／selected 样式及反馈文字                               |
| 3. Table 窄区域           | 在固定 320px secondary 容器内横向滚动至末列再返回                                                      | 表格自身最小宽 44rem（默认根字号下为 704px），滚动由现有 ScrollContainer 承担；页面不横向溢出，内容和焦点可见，不为了适配压缩控件                                                        | 容器／内容 scrollWidth、clientWidth、左右端位置、页面溢出及截图；记录实际根字号                    |
| 4. Table sortable 表头    | 分别打开 Default／SecondaryVariant；hover `Member` 再移开；真实聚焦该列并激活排序两次                  | 初始按 name 升序；激活后排序方向／行顺序按现有模板变化。Rain 可排序表头 hover 恢复 `#14233C`，移开回 `#7485A8`；焦点与指示器沿原版。Layouts 表头没有 allowsSorting，不能用它声称排序已验 | `aria-sort`、前几行顺序、hover／默认／focus、primary／secondary 分开记录                           |
| 5. Tabs 长名称与 hover    | 在 Layouts 两个 Tabs 列表 hover 实际溢出的文字，再移开；记录长名称和禁用名称                           | Rain 普通名称单行、最大 14em、实际溢出省略，Tab 高度沿原版 32px；只有实际溢出才临时加完整原生 title，mouseleave 清除。Indicator／焦点环在裁剪文字层之外                                  | 每个被测 label 的 width／scrollWidth／height／whiteSpace／textOverflow、title 前后、Tab 高度及截图 |
| 6. Tabs 键盘／禁用        | 从“课堂练习作答与逐题批改记录”用方向键切换；End 到“需要优先关注的疑难问题整理”；hover 并点击禁用归档项 | 方向键跳过第三个禁用项，选中面板和“当前标签”反馈一致；禁用文字可 hover 全名，但不能选择。窄区保留原版滚动／溢出导航；记录真实焦点，不把鼠标 hover 当键盘提示                             | selected／focused、面板与反馈、禁用点击前后、滚动位置及原生 title                                  |
| 7. Tabs 短名／文档一致性  | 打开 Tabs Default，hover 未实际溢出的 Overview；再打开当前 Tabs 文档，对现有示例只取名称包装／样式     | 不溢出不加 title；文档站与 workspace 采用同一本地实现。原生 title 不承诺键盘聚焦弹层或触屏提示，完整 DOM 名称保留不等于读屏已验                                                          | 短 label 的实际宽度／title、文档 URL／根主题／label 计算样式；不遍历全页所有 demo                  |
| 8. 原版恢复与差异解释     | 对 Layouts、Table 两补充页、Tabs Default 恢复 Light／Dark；在相同状态复取关键节点                      | Rain Table 局部背景／表头色撤销，Tabs 原版不启用 Rain 单行截断样式。文字包装这个已授权源码补丁仍存在，不能要求 DOM 与上游字节相同；可见几何／交互应保持原版范围                          | 两主题恢复截图与数据；把允许的文字布局例外、字体影响和真实回归分列                                 |

**本组停止边界：** 不扩展列宽调整、虚拟化、异步加载、全部表格状态或竖向／富文本 Tabs，不更改上游 opacity／排序／选择规则。原版表格含 CDN 头像，若外部图片失败单列外部资源问题，不临时下载或改样本。对已确认表头／衬底色和 Tabs hover 对比度可记录实测与限制，不能自行改色或改 opacity。当前普通名称确认不扩展为任意富文本自动省略、键盘 Tooltip 或全平台无障碍通过。

## 收尾与中断条件

- 本批固定为 **4 个集中 story＋5 个上游补充 story**，文档只做上述指定节点核对，不顺手变成全库或整站扫描。遇路由未注册、当前来源无法确认、页面错误或交互异常，先保存 URL／操作／候选身份和原版对照，标记中断／未验证；不新增故事或绕过守卫以继续。
- 每组只将真实完成的路径追加到 [P5 模块矩阵](p5-component-matrix.md) 和 [遗留台账](p5-open-issues.md)。即使本批全部指定步骤完成，也仅称“近期改动组件定向复查完成”，不把 87 模块的最终状态整体改成通过。
- 发现问题先区分样本业务状态、环境／外部资源、原版同样存在与 Rain 回归。涉及已确认颜色、上游交互、基础 API 或范围扩展时先记录具体复现和最小建议；本文不授权自动实施。没有问题也要记录未覆盖的模式、平台与组合。
- 新证据与失败过程保留，不刷新或覆盖旧 r2 包／report，不将 workspace 页面结果写入旧消费者记录；若后续确需源码修复或重新交付，另定候选身份与验证范围。
- 编制计划时只有本文件；后续实际截图、操作和验证范围以顶部链接的复查报告为准，没有新增用户对全库的视觉确认。

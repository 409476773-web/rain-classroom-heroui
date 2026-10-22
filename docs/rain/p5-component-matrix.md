# P5 逐模块核验矩阵

记录日期：2026-10-21。上游基准为 HeroUI **3.2.6** / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`；当前私有 r2 交付为 React／Styles **3.2.6-rain.1**、Rain Theme **0.1.2**。首轮为既有资料整理；F 记录 20 日四组 9 个指定 story，N 追加 21 日 51 个去重选定 story 的指定路径与 3 个历史 release 页面。未运行重测试、全 story 扫描或生产构建。

范围以 [inventory.json](inventory.json) 与 [组件目录](../../apps/docs/src/generated/rain-catalog.json) 的 **87 个源码模块**为准，按目录分类逐条列出。其中 85 个在根 barrel 导出；有自有组件文档的模块为 **72 个**，另 **15 个**无自有文档。每语言 **73 份组件文档文件**不是“73 个模块各有自有文档”。87 条目录均有预览路由，其中 **17 条标为关联预览**；直接路由也不保证独立演示或独立验收。具体文档路径、示例和 story ID 可查 [AI 定位索引](ai/components.md)。

当前源码为 **596 个 story exports**，历史生产索引为 **587 个 stories**；9 项差额是批改页与 8 个集中复查样本，仍保留 `mismatch`。资料可达、历史检查、当前定向检查、用户视觉确认及最终验收分别记录，不能互相替代。所有模块最终状态仍为“待最终核验”；年份模块保留“有已知限制”。这不是 87 个独立成熟组件的通过清单。

## 证据代码与使用边界

| 代码 | 对应记录与证据                                                                                                                                                                                                                             | 本页如何使用                                                                                                                                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H    | [19 日状态记录](state-audit.md)、[历史证据目录](../../evidence/runtime/rain-theme-state-audit-2026-10-19/)                                                                                                                                 | 当日 587-story 初始渲染、CSS 状态和部分真实交互的历史快照；不是当前逐模块绿灯，也不把组合或 CSS 记录当作该模块独立键盘通过。                                                                                                            |
| B1   | [第一批](visual-review-batch-1-2026-10-20.md)、[证据目录](../../evidence/runtime/rain-visual-batch-1-2026-10-20/)                                                                                                                          | 四类按钮及组、输入提示／前后缀、ListBox／Select 的指定状态与路径。                                                                                                                                                                      |
| B2   | [第二批](visual-review-batch-2-2026-10-20.md)、[证据目录](../../evidence/runtime/rain-visual-batch-2-2026-10-20/)                                                                                                                          | 直接 Menu、日历年份入口及 DatePicker 指定路径；年份焦点恢复限制未解决。                                                                                                                                                                 |
| B3   | [第三批](visual-review-batch-3-2026-10-20.md)、[证据目录](../../evidence/runtime/rain-visual-batch-3-2026-10-20/)                                                                                                                          | Table／Tabs／Card、Modal／Drawer／Toast、ErrorMessage 指定路径；当时的 Table／Tabs 外观由后续 T／L 记录补充。                                                                                                                           |
| T    | [表格反馈](table-feedback-2026-10-20.md)、[第二轮证据](../../evidence/runtime/rain-table-feedback-2026-10-20/round-2/verification.json)                                                                                                    | 最新衬底 `#EBEFFF`、表头文字 `#7485A8`；54 节点中 6 处背景变化，其他所取样式保持。                                                                                                                                                      |
| L    | [Tabs 反馈](tabs-label-feedback-2026-10-20.md)、[补丁证据](../../evidence/runtime/rain-tabs-label-2026-10-20/verification.json)                                                                                                            | 普通文字名称单行、省略、实际溢出时原生 title；两文件 10 项定向用例。任意富文本与键盘全名弹层不由此推导。                                                                                                                                |
| F    | [P5 四组定向复查](p5-focused-review-2026-10-20.md)、[最终样式对照](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/style-comparison-final.json)、[证据断言](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/focused-checks.json) | 9 个指定 story 的实际路径与 377 个默认态节点；18 对原版 Light／Dark 恢复的所取样式零差异。Rain 几何只比较列明的 14 属性，保留 1 处获授权 Tabs label 高度差。19 项为现有浏览器证据断言，不是组件测试数量。                               |
| N    | [P5 后续定向复查](p5-followup-review-2026-10-21.md)、[入口记录](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/browser-entries.json)、[对比度取样](../../evidence/runtime/rain-p5-followup-2026-10-21-r1/contrast-calculation.json) | 51 个去重选定 story 的指定路径；修复 Storybook Rain body 正文色继承，Popover 3 个节点在原版 Light／Dark 的 color／font 恢复；不是全库逐状态或全平台通过。21 个对比度样本保留低值；OTP 文案残留和 Autocomplete 关闭焦点限制见 I14／I15。 |
| R2   | [当前消费记录](consumer-verification.md)、[归档报告](../../delivery/rain-heroui-local-2026-10-20-r2/report.json)、[消费者页面证据](../../evidence/runtime/rain-delivery-r2-2026-10-20/browser-checks.json)                                 | 仅用于真实消费者组合中的 Button、Card、Form、TextField、Input、Label、Description、FieldError、Tabs、Table、Modal 及其实际关闭部件；不扩展为全库消费或所有导出运行通过。                                                                |

下表“自有／关联”描述当前目录的资料关系，不代表成熟度。“待补定向复查”表示没有后续分批记录，不能写成不适用。辅助模块随父级／API 核验，不为其虚构独立状态。所有行仍需最终版本下的适用状态、主题恢复、长中文／窄区域及必要输入路径核验；各格仅列该模块的重点。

## 按钮（buttons，5）

| 模块（源码）                                                                            | 资料／预览     | 最近定向已记录范围＋证据代码                                                                                                     | 仍待验证重点                              | P5 状态    |
| --------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------- |
| [button](../../packages/react/src/components/button/index.ts)                           | 自有文档／预览 | B1：10px、尺寸、图标、hover／focus／disabled；R2：提交及返回按钮；F：四变体真实 hover、键盘焦点／pressed、宿主字体修复与原版恢复 | 其余变体、加载与触控；最终状态组合        | 待最终核验 |
| [button-group](../../packages/react/src/components/button-group/index.ts)               | 自有文档／预览 | B1：连接横／纵、RTL、单项与外缘圆角；F：既有横／纵／RTL／单项样本连接边、禁用和主题恢复                                          | 其他尺寸／禁用组合、长中文                | 待最终核验 |
| [close-button](../../packages/react/src/components/close-button/index.ts)               | 自有文档／预览 | B3：浮层关闭部件；R2：Modal 关闭钮为 12px                                                                                        | 独立尺寸、hover／focus／disabled、名称    | 待最终核验 |
| [toggle-button](../../packages/react/src/components/toggle-button/index.ts)             | 自有文档／预览 | B1：选中、禁用、Space 切换、10px；F：真实选择、禁用守卫与指定节点主题恢复                                                        | 更多选中＋hover／pressed／focus组合、长文 | 待最终核验 |
| [toggle-button-group](../../packages/react/src/components/toggle-button-group/index.ts) | 自有文档／预览 | B1：attached／detached、RTL 方向键；F：三方向连接组焦点／选择、detached 取消及新增、禁用与恢复                                   | 更多空选、禁用与窄区组合                  | 待最终核验 |

## 列表与集合（collections，9）

| 模块（源码）                                                                      | 资料／预览                                       | 最近定向已记录范围＋证据代码                                                                                          | 仍待验证重点                         | P5 状态    |
| --------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------- |
| [dropdown](../../packages/react/src/components/dropdown/index.ts)                 | 自有文档／预览                                   | H：历史记录；B2 直接 Menu 不替代本模块；N：打开、End 跳过禁用危险项、Esc 返回触发器                                   | 子菜单、单／多选、长文与更多关闭方式 | 待最终核验 |
| [list-box](../../packages/react/src/components/list-box/index.ts)                 | 自有文档／预览                                   | B1：单／多选、浅底、hover、禁用、危险项、键盘；F：真实方向键／Space、再次点击取消、多选保留其余项、禁用跳过与原版恢复 | 分组、空态、长列表、更多选择方式     | 待最终核验 |
| [list-box-item](../../packages/react/src/components/list-box-item/index.ts)       | 无独立文档；关联 ListBox 预览                    | B1：实际 Item 的选中／禁用／危险项；F：selected hover、禁用且选中、危险样本及实际 Label／Indicator 色                 | 随父级/API核验；复杂内容与焦点组合   | 待最终核验 |
| [list-box-section](../../packages/react/src/components/list-box-section/index.ts) | 无独立文档；关联 ListBox 预览                    | H：父级历史记录；B1 无独立分组结论                                                                                    | 随父级/API核验；分组名称与键盘跨组   | 待最终核验 |
| [menu](../../packages/react/src/components/menu/index.ts)                         | 无独立文档；自有本地 Menu 预览                   | B2：直接 Menu 命令、单／多选、禁用、危险、键盘                                                                        | 其余变体、长文、更多选择组合         | 待最终核验 |
| [menu-item](../../packages/react/src/components/menu-item/index.ts)               | 无独立文档；目录关联 Dropdown，另有 B2 Menu 组合 | B2：直接 Menu.Item 的命令与选择状态                                                                                   | 随父级/API核验；不沿 Dropdown 推覆盖 | 待最终核验 |
| [menu-section](../../packages/react/src/components/menu-section/index.ts)         | 无独立文档；目录关联 Dropdown，另有 B2 Menu 组合 | B2：直接 Menu.Section 分组与快捷键显示                                                                                | 随父级/API核验；跨组焦点与具名语义   | 待最终核验 |
| [tag](../../packages/react/src/components/tag/index.ts)                           | 关联 TagGroup 文档／Autocomplete 组合预览        | B3：TagGroup 内选中与条件错误组合                                                                                     | 随父级/API核验；删除、禁用、焦点返回 | 待最终核验 |
| [tag-group](../../packages/react/src/components/tag-group/index.ts)               | 自有文档／预览                                   | B3：选择消除错误、清空恢复错误                                                                                        | 长文、移除键盘、禁用、更多变体       | 待最终核验 |

## 颜色（colors，7）

| 模块（源码）                                                                            | 资料／预览                            | 最近定向已记录范围＋证据代码                                                                   | 仍待验证重点                               | P5 状态    |
| --------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------- |
| [color-area](../../packages/react/src/components/color-area/index.ts)                   | 自有文档／预览                        | H：历史渲染／样式；未见后续定向记录；N：ColorPicker 内色域显示、独立禁用样本                   | 实际二维拖动／键盘、焦点及更多通道         | 待最终核验 |
| [color-field](../../packages/react/src/components/color-field/index.ts)                 | 自有文档／预览                        | H：历史字段状态记录；N：ColorPicker 内 RGB 分量编辑、独立错误及禁用                            | 独立颜色解析／恢复、只读、提示色与更多格式 | 待最终核验 |
| [color-input-group](../../packages/react/src/components/color-input-group/index.ts)     | 内部辅助；无独立文档；关联 ColorField | H：父级历史样式记录；N：RGB 输入与 ColorField 错误／禁用组合                                   | 随父级/API核验；前后缀、错误＋聚焦及只读   | 待最终核验 |
| [color-picker](../../packages/react/src/components/color-picker/index.ts)               | 自有文档／预览                        | H：历史浮层 16px 映射与样式记录；N：打开、Hue 键盘改变、切换 RGB 并编辑、Esc 返回；16px portal | 实际二维拖动、色板组合、其他关闭及窄区     | 待最终核验 |
| [color-slider](../../packages/react/src/components/color-slider/index.ts)               | 自有文档／预览                        | H：历史渲染／样式记录；N：组合 Hue 键盘、alpha 0／1、独立禁用                                  | 实际拖动、纵向、更多通道与焦点组合         | 待最终核验 |
| [color-swatch](../../packages/react/src/components/color-swatch/index.ts)               | 自有文档／预览                        | H：历史渲染／样式记录；N：ColorPicker 随 RGB 变化的色样及 SwatchPicker 显示                    | 独立透明棋盘格、边界、更多尺寸与数据色     | 待最终核验 |
| [color-swatch-picker](../../packages/react/src/components/color-swatch-picker/index.ts) | 自有文档／预览                        | H：历史渲染／样式记录；N：键盘选中 #D946EF 与勾选同步、全禁用样本                              | 更多布局、色名、部分禁用与选择组合         | 待最终核验 |

## 选择控件（controls，3）

| 模块（源码）                                                              | 资料／预览                 | 最近定向已记录范围＋证据代码                                                                 | 仍待验证重点                                                   | P5 状态    |
| ------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| [slider](../../packages/react/src/components/slider/index.ts)             | 自有文档／预览             | H：历史 CSS 状态；未见后续定向记录；N：双端 150／450、相遇 450／450、纵向 30→31、禁用保持 30 | 实际拖动、首尾边界、更多步长及触控                             | 待最终核验 |
| [switch](../../packages/react/src/components/switch/index.ts)             | 自有文档／预览             | H：历史样式记录；无后续状态复查结论；N：Space off→on→off、禁用且选中、固定错误聚焦           | 真实 hover／pressed、尺寸与更多错误／禁用组合                  | 待最终核验 |
| [switch-group](../../packages/react/src/components/switch-group/index.ts) | 关联 Switch 文档／自有预览 | H：父级历史记录；入口跳转不算状态复查；N：三项独立切换为开／开／关                           | 随父级/API核验；组名称、横向及各项禁用；布局容器不提供统一选择 | 待最终核验 |

## 数据展示（data-display，3）

| 模块（源码）                                                | 资料／预览     | 最近定向已记录范围＋证据代码                                                                                                                        | 仍待验证重点                                                                | P5 状态    |
| ----------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| [badge](../../packages/react/src/components/badge/index.ts) | 自有文档／预览 | H：仅历史记录；未见后续定向复查                                                                                                                     | 待补定向：位置、长值、颜色与窄区                                            | 待最终核验 |
| [chip](../../packages/react/src/components/chip/index.ts)   | 自有文档／预览 | H：历史颜色／soft 配方和变体抽查                                                                                                                    | 待补定向：颜色、尺寸、长文、图标与实际交互组合；原生Chip不虚构删除／禁用API | 待最终核验 |
| [table](../../packages/react/src/components/table/index.ts) | 自有文档／预览 | B3：选择、禁用行、704px 内滚；T：新配色；R2：真实组合；F：primary／secondary 配色、行／全选与禁用跳过、Member hover／两次排序、320px 内滚和原版恢复 | 虚拟化、列宽与更多焦点／选择组合、跨平台                                    | 待最终核验 |

## 日期与时间（date-and-time，8）

| 模块（源码）                                                                              | 资料／预览                                           | 最近定向已记录范围＋证据代码                                                                               | 仍待验证重点                                     | P5 状态    |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [calendar](../../packages/react/src/components/calendar/index.ts)                         | 自有文档／预览                                       | B2：年份打开、方向键、选年返回日期网格                                                                     | 日期禁用／范围／只读；内部年份焦点限制随父级保留 | 待最终核验 |
| [calendar-year-picker](../../packages/react/src/components/calendar-year-picker/index.ts) | 进行中；无独立文档；Calendar／RangeCalendar 组合预览 | B2：选年／Esc 后焦点仍落隐藏年份；原版同样复现                                                             | 焦点恢复未解决；真实 hover、全部边界与历法       | 有已知限制 |
| [date-field](../../packages/react/src/components/date-field/index.ts)                     | 自有文档／预览                                       | B2：DatePicker内Group／Input／Segment等部件组合显示；N：独立分段 2026-10-20 错误→21 日恢复、有值／空值禁用 | 只读、更多日期边界／格式与焦点组合               | 待最终核验 |
| [date-input-group](../../packages/react/src/components/date-input-group/index.ts)         | 内部辅助；无独立文档；关联 DateField                 | H：分段／前后缀历史样式记录；N：DateField／TimeField 分段与 DateRangePicker 双端组合                       | 随父级/API核验；前后缀、只读及更多错误＋聚焦     | 待最终核验 |
| [date-picker](../../packages/react/src/components/date-picker/index.ts)                   | 自有文档／预览                                       | B2：禁用／错误、年份 portal、Esc 返回触发器                                                                | 分段编辑、日期选择／清除、边界与只读             | 待最终核验 |
| [date-range-picker](../../packages/react/src/components/date-range-picker/index.ts)       | 自有文档／预览                                       | H：历史浮层圆角及字段样式记录；N：受控 end 25→26 日同步摘要、打开范围网格、Esc 返回触发器                  | 实际选择两端／中段、start 编辑、校验／禁用／只读 | 待最终核验 |
| [range-calendar](../../packages/react/src/components/range-calendar/index.ts)             | 自有文档／预览                                       | B2：年份 2026–2028、End／Esc；焦点限制保留；N：DateRangePicker 内已选 21–26 日范围网格显示                 | 实际端点选择、禁用间隔与只读；年份焦点限制保留   | 待最终核验 |
| [time-field](../../packages/react/src/components/time-field/index.ts)                     | 自有文档／预览                                       | H：历史分段字段样式记录；N：分段 08:00 错误→09:00 恢复、有值／空值禁用                                     | 只读、上界 17:00、更多制式与焦点组合             | 待最终核验 |

## 状态反馈（feedback，6）

| 模块（源码）                                                                    | 资料／预览     | 最近定向已记录范围＋证据代码                                           | 仍待验证重点                                             | P5 状态    |
| ------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| [alert](../../packages/react/src/components/alert/index.ts)                     | 自有文档／预览 | H：历史状态色／soft 样式记录；N：五状态、长描述与内部按钮显示          | 窄区、内部操作焦点；现有按钮无业务回调，不推断请求或关闭 | 待最终核验 |
| [meter](../../packages/react/src/components/meter/index.ts)                     | 自有文档／预览 | H：历史初始渲染；未见后续定向记录；N：750／1000、US$750.00 与填充显示  | 更多数值／范围、颜色、标签与窄区                         | 待最终核验 |
| [progress-bar](../../packages/react/src/components/progress-bar/index.ts)       | 自有文档／预览 | H：仅历史记录；未见后续定向复查；N：五色确定值 50% 与不确定进度显示    | 更多数值边界、长标签、窄区及减弱动画                     | 待最终核验 |
| [progress-circle](../../packages/react/src/components/progress-circle/index.ts) | 自有文档／预览 | H：仅历史记录；未见后续定向复查；N：五色确定值 60% 与不确定进度显示    | 更多尺寸／数值、标签及减弱动画                           | 待最终核验 |
| [skeleton](../../packages/react/src/components/skeleton/index.ts)               | 自有文档／预览 | H：历史初始渲染；N：Default 初始显示与动画取样                         | 其他动画、窄区、减弱动画；旧示例工具类不据此完成核验     | 待最终核验 |
| [spinner](../../packages/react/src/components/spinner/index.ts)                 | 自有文档／预览 | H：历史初始渲染；N：accent／current／success／warning／danger 五色显示 | 更多尺寸、current 复杂继承、减弱动画及辅助技术           | 待最终核验 |

## 表单（forms，17）

| 模块（源码）                                                                  | 资料／预览                                 | 最近定向已记录范围＋证据代码                                                                                                                                                     | 仍待验证重点                                       | P5 状态    |
| ----------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------- |
| [checkbox](../../packages/react/src/components/checkbox/index.ts)             | 自有文档／预览                             | H：历史 CSS 与真实交互抽样；N：组内空提交错误、选择恢复、多选及整组禁用                                                                                                          | 随父级/API核验；半选、错误＋选中、独立禁用及焦点   | 待最终核验 |
| [checkbox-group](../../packages/react/src/components/checkbox-group/index.ts) | 自有文档／预览                             | H：历史组级样式记录；N：空提交错误、选择恢复、两项多选及整组禁用                                                                                                                 | 半选、部分禁用、更多变体与长标签                   | 待最终核验 |
| [description](../../packages/react/src/components/description/index.ts)       | 自有文档／关联 Autocomplete 预览           | B1：辅助说明与浅提示区分；R2：实际表单组合；F：本批输入／列表辅助文字与提示色分别取样                                                                                            | 随父级/API核验；长文、禁用与错误可见性             | 待最终核验 |
| [error-message](../../packages/react/src/components/error-message/index.ts)   | 自有文档／独立本地复查预览                 | B3：三类错误显示、条件消失／恢复                                                                                                                                                 | 更多变体、长文／窄区、关联语义                     | 待最终核验 |
| [field-error](../../packages/react/src/components/field-error/index.ts)       | 自有文档／关联 Autocomplete 预览           | B1/B3：字段错误；R2：空／有效／空白提交与错误清理；F：五族输入及 Select 的固定错误组合显示，不新增校验回路；N：Radio／Checkbox 组、Date／Time 真实错误与恢复；OTP 文案残留见 I14 | 随父级/API核验；OTP 已知限制、其他组与完整关联语义 | 待最终核验 |
| [fieldset](../../packages/react/src/components/fieldset/index.ts)             | 自有文档／预览                             | H：历史组级样式记录                                                                                                                                                              | 待补定向：legend、禁用继承、组错误                 | 待最终核验 |
| [form](../../packages/react/src/components/form/index.ts)                     | 自有文档／关联 Autocomplete 预览           | R2：空值／空白阻止、Enter 有效提交、返回保留                                                                                                                                     | 原生／aria 校验模式、重置与不同字段组合            | 待最终核验 |
| [input](../../packages/react/src/components/input/index.ts)                   | 自有文档／预览                             | B1：空／有值、只读／禁用／错误；R2：实际输入；F：实际输入／清空、固定错误聚焦、只读／禁用路径及原版恢复                                                                          | secondary、更多输入类型、自动填充／组合输入及触控  | 待最终核验 |
| [input-group](../../packages/react/src/components/input-group/index.ts)       | 自有文档／预览                             | B1：6 个固定前后缀恢复辅助文字色；F：金额输入／清空保留单位、Invalid 默认／聚焦、Disabled 与原版恢复                                                                             | 前后交互按钮、TextArea／只读及嵌套组合             | 待最终核验 |
| [input-otp](../../packages/react/src/components/input-otp/index.ts)           | 自有文档／预览                             | H：历史 slot 样式；未见后续定向复查；N：6 位错误提交、编辑撤销 6 槽位错误标记、左右移动／删除、禁用；文案仍可见见 I14                                                            | I14 示例文案残留、粘贴、成功完成与更多焦点组合     | 待最终核验 |
| [label](../../packages/react/src/components/label/index.ts)                   | 自有文档／关联 Autocomplete 预览           | B1/B2/B3：组合文字；R2：真实输入标签；F：本批实际输入／列表 Label 前景色、错误及禁用组合取样                                                                                     | 随父级/API核验；更多关联、必填、禁用与长文组合     | 待最终核验 |
| [number-field](../../packages/react/src/components/number-field/index.ts)     | 自有文档／预览                             | B1：浅提示、18.5 正文、焦点、错误／禁用／只读；F：实际 18→18.5→18、0／20 边界按钮、状态及原版恢复                                                                                | 更多键盘路径、不同数字制式、IME／触控              | 待最终核验 |
| [radio](../../packages/react/src/components/radio/index.ts)                   | 关联 RadioGroup 文档／AvatarGroup 组合预览 | H：历史样式；无后续独立状态结论；N：组内空提交错误、方向键改选 Pro、整组禁用且 Pro 选中                                                                                          | 随父级/API核验；选中＋错误、独立禁用与更多方向     | 待最终核验 |
| [radio-group](../../packages/react/src/components/radio-group/index.ts)       | 自有文档／预览                             | H：历史组级样式记录；N：空提交错误、方向键改选 Pro 后恢复、整组禁用且选中                                                                                                        | 部分禁用、横向、更多变体与长标签                   | 待最终核验 |
| [search-field](../../packages/react/src/components/search-field/index.ts)     | 自有文档／预览                             | B1：专用提示色、正文、错误／禁用／只读；F：实际 Esc／Close 清空并保留输入焦点、Tab 路径与原版恢复；N：Autocomplete portal 过滤至无结果及选项；关闭焦点限制见 I15                 | 搜索／重置事件、IME／触控、窄区；I15 指定路径焦点  | 待最终核验 |
| [textarea](../../packages/react/src/components/textarea/index.ts)             | 自有文档／预览                             | B1：浅提示、正文、错误／只读样本；B3：浮层输入；F：两行输入／清空、固定错误聚焦与原版恢复                                                                                        | secondary／禁用、长文、调整尺寸、组合输入          | 待最终核验 |
| [textfield](../../packages/react/src/components/textfield/index.ts)           | 自有文档／预览                             | B1/B3：字段状态；R2：受控错误及提交回路；F：本批输入组合标签、只读／禁用与固定错误路径，不推断提交校验                                                                           | 更多校验／重置、描述与错误切换、嵌套组合           | 待最终核验 |

## 布局与容器（layout，4）

| 模块（源码）                                                        | 资料／预览     | 最近定向已记录范围＋证据代码                             | 仍待验证重点                                                     | P5 状态    |
| ------------------------------------------------------------------- | -------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| [card](../../packages/react/src/components/card/index.ts)           | 自有文档／预览 | B3：320px 长文／内部按钮、16px；R2：实际组合             | 其他变体／组合；自身无 hover／disabled／invalid 设计状态，不新增 | 待最终核验 |
| [separator](../../packages/react/src/components/separator/index.ts) | 自有文档／预览 | B2：菜单分隔组合显示；无独立状态结论                     | 待补定向：横／纵、表面与边界辨识                                 | 待最终核验 |
| [surface](../../packages/react/src/components/surface/index.ts)     | 自有文档／预览 | H：历史四类 surface 与组合样式                           | 待补定向：层级／嵌套；交互由内部控件负责                         | 待最终核验 |
| [toolbar](../../packages/react/src/components/toolbar/index.ts)     | 自有文档／预览 | H：历史初始渲染；N：水平工具栏 Bold 后 Right 聚焦 Italic | 完整组间导航、End／Home、禁用、纵向与窄区                        | 待最终核验 |

## 媒体（media，2）

| 模块（源码）                                                              | 资料／预览     | 最近定向已记录范围＋证据代码                                                 | 仍待验证重点                             | P5 状态    |
| ------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------- | ---------------------------------------- | ---------- |
| [avatar](../../packages/react/src/components/avatar/index.ts)             | 自有文档／预览 | H：历史渲染／圆形保护；无后续定向复查；N：文字／图标 fallback 与五状态色显示 | 加载、失败延迟回退、尺寸、名称与网络依赖 | 待最终核验 |
| [avatar-group](../../packages/react/src/components/avatar-group/index.ts) | 自有文档／预览 | H：历史初始渲染；N：max=3 显示三个头像及 +2                                  | 其他重叠、显式 Count、长名与窄区         | 待最终核验 |

## 导航（navigation，7）

| 模块（源码）                                                                      | 资料／预览     | 最近定向已记录范围＋证据代码                                                                                                                      | 仍待验证重点                                                  | P5 状态    |
| --------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------- |
| [accordion](../../packages/react/src/components/accordion/index.ts)               | 自有文档／预览 | H：仅历史记录；未见后续定向复查；N：两项展开后关闭第一项的 aria-expanded 切换                                                                     | 退出动画结束、禁用、单展开、完整键盘与长标题                  | 待最终核验 |
| [breadcrumbs](../../packages/react/src/components/breadcrumbs/index.ts)           | 自有文档／预览 | H：历史导航样式记录；N：整组禁用样本显示                                                                                                          | 当前项语义、长路径、键盘与窄区；无现成折叠样本                | 待最终核验 |
| [disclosure](../../packages/react/src/components/disclosure/index.ts)             | 自有文档／预览 | H：仅历史记录；未见后续定向复查；N：开／关 aria-expanded 切换、禁用保持关闭                                                                       | 退出动画结束、内部焦点、更多键盘与长文                        | 待最终核验 |
| [disclosure-group](../../packages/react/src/components/disclosure-group/index.ts) | 自有文档／预览 | H：仅历史记录；未见后续定向复查；N：单展开由 preview 切换至 download 的 aria-expanded                                                             | 多展开、禁用、关闭动画结束与焦点                              | 待最终核验 |
| [link](../../packages/react/src/components/link/index.ts)                         | 自有文档／预览 | H：历史样式记录；入口可点击不是全状态结论；N：Tab 跳过禁用项到 HeroUI 外链，未触发外部跳转                                                        | hover／focus、其余变体与长文                                  | 待最终核验 |
| [pagination](../../packages/react/src/components/pagination/index.ts)             | 自有文档／预览 | H：历史渲染／样式记录；N：第 1→2→12 页、摘要与首尾禁用同步                                                                                        | 更多键盘、尺寸、多页窄区；样本最小宽度 640px                  | 待最终核验 |
| [tabs](../../packages/react/src/components/tabs/index.ts)                         | 自有文档／预览 | B3：方向键／End；L：名称补丁 10 项；R2：真实标签与禁用跳过；F：长名实际溢出 title／移出清理、禁用守卫、键盘、短名无 title、指定文档节点与原版恢复 | 富文本调用方布局、各方向／变体、触控／辅助技术与 hover 对比度 | 待最终核验 |

## 浮层（overlays，6）

| 模块（源码）                                                              | 资料／预览     | 最近定向已记录范围＋证据代码                                                                                                     | 仍待验证重点                                     | P5 状态    |
| ------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------- |
| [alert-dialog](../../packages/react/src/components/alert-dialog/index.ts) | 自有文档／预览 | H：历史上游交互／CSS 记录；N：打开、Tab／Shift+Tab 循环、默认 Esc 保持、Cancel 返回触发器                                        | 确认／Close、其他状态／关闭策略、长文与窄区      | 待最终核验 |
| [drawer](../../packages/react/src/components/drawer/index.ts)             | 自有文档／预览 | B3：窄区、长文滚动、Tab 循环、Esc 返回                                                                                           | 其他方向、嵌套、触控、滚动锁定组合               | 待最终核验 |
| [modal](../../packages/react/src/components/modal/index.ts)               | 自有文档／预览 | B3：滚动／焦点循环／Esc；R2：portal、关闭保值返回                                                                                | 嵌套、不同初始焦点、其他尺寸与触控               | 待最终核验 |
| [popover](../../packages/react/src/components/popover/index.ts)           | 自有文档／预览 | H：历史样式／交互记录；B1 Select 浮层不替代独立核验；N：裸标题／正文色修复、Esc 返回；3 节点原版 Light／Dark 的 color／font 恢复 | 各方向、外点、其他内容与窄区；不扩展为全状态恢复 | 待最终核验 |
| [toast](../../packages/react/src/components/toast/index.ts)               | 自有文档／预览 | B3：成功／错误长文、单条键盘关闭／清空、320px                                                                                    | 自动消失、队列／暂停、焦点及辅助技术             | 待最终核验 |
| [tooltip](../../packages/react/src/components/tooltip/index.ts)           | 自有文档／预览 | H：历史记录；L 原生 title 不是本组件验证；N：键盘聚焦显示、正文色／字体、Esc 关闭                                                | 真实 hover、延迟／退出时序、触控与其他方向       | 待最终核验 |

## 选择器（pickers，5）

| 模块（源码）                                                              | 资料／预览                       | 最近定向已记录范围＋证据代码                                                                                                                            | 仍待验证重点                                         | P5 状态    |
| ------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------- |
| [autocomplete](../../packages/react/src/components/autocomplete/index.ts) | 自有文档／预览                   | H：历史渲染／样式及多选Tag删除用例；不是键盘导航结论；N：过滤／空态、跳过禁用 Cat、Bird 选择、清空及 Esc 关闭；指针打开→Esc 焦点落 body，原版同现见 I15 | I15 焦点限制、键盘打开、多选／只读、整控件禁用及校验 | 待最终核验 |
| [combo-box](../../packages/react/src/components/combo-box/index.ts)       | 自有文档／预览                   | H：历史字段／浮层记录；N：过滤 Elephant、跳过禁用 Cat 选 Bird、Esc 关闭且保留输入焦点                                                                   | 清除、错误、整控件禁用、多选与更多焦点组合           | 待最终核验 |
| [empty-state](../../packages/react/src/components/empty-state/index.ts)   | 关联 Autocomplete 文档／组合预览 | H：组合历史记录；无后续独立结论；N：Autocomplete 无结果 No results found                                                                                | 随父级/API核验；长文、内部操作与其他父级             | 待最终核验 |
| [header](../../packages/react/src/components/header/index.ts)             | 关联 Autocomplete 文档／组合预览 | B2：实际菜单分组标题显示                                                                                                                                | 随父级/API核验；语义、长标题与不同父级               | 待最终核验 |
| [select](../../packages/react/src/components/select/index.ts)             | 自有文档／预览                   | B1：portal、禁用跳过、Enter 选择、Esc 返回；F：真实 portal 选择／Esc 焦点返回、Fields primary／secondary／固定错误与禁用状态、原版恢复                  | 多选／只读、长值、窄区与触控                         | 待最终核验 |

## 组合部件与辅助模块（supporting，2）

| 模块（源码）                                            | 资料／预览                                           | 最近定向已记录范围＋证据代码                  | 仍待验证重点                                 | P5 状态    |
| ------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- | -------------------------------------------- | ---------- |
| [icons](../../packages/react/src/components/icons.tsx)  | 辅助模块；无独立文档；关联 Accordion                 | H：组合历史记录；不是独立组件状态通过         | 随父级/API核验；currentColor、方向、名称边界 | 待最终核验 |
| [rac](../../packages/react/src/components/rac/index.ts) | 辅助模块；关联 Autocomplete 文档／ColorArea 组合预览 | H：组合历史记录；不把转发原语当独立 Rain 组件 | 随父级/API核验；实际导出、上下文与语义       | 待最终核验 |

## 文字（typography，2）

| 模块（源码）                                                          | 资料／预览     | 最近定向已记录范围＋证据代码         | 仍待验证重点                               | P5 状态    |
| --------------------------------------------------------------------- | -------------- | ------------------------------------ | ------------------------------------------ | ---------- |
| [kbd](../../packages/react/src/components/kbd/index.ts)               | 自有文档／预览 | B2：菜单快捷键提示显示，不注册快捷键 | 待补定向：组合键、尺寸、字体回退与窄区     | 待最终核验 |
| [typography](../../packages/react/src/components/typography/index.ts) | 自有文档／预览 | B1/B2/B3：集中预览标题／正文组合     | 待补定向：完整文字层级、中英数字及字体回退 | 待最终核验 |

## 辅助工具（utilities，1）

| 模块（源码）                                                                | 资料／预览     | 最近定向已记录范围＋证据代码                                    | 仍待验证重点                                             | P5 状态    |
| --------------------------------------------------------------------------- | -------------- | --------------------------------------------------------------- | -------------------------------------------------------- | ---------- |
| [scroll-shadow](../../packages/react/src/components/scroll-shadow/index.ts) | 自有文档／预览 | H：历史滚动边缘／中段、内容适配及横向RTL用例；不由Table滚动推断 | 当前横／纵阴影、动态内容与窄区复核；旧运行不当作本轮通过 | 待最终核验 |

## 最终核验仍保留的共同边界

- 87 行的资料关系与已有证据只形成核验台账。没有后续定向记录的模块仍需补查，不用 H 的 587-story 历史 smoke 把当前状态标绿。
- F 已完成四组清单的本轮指定路径，9 个入口可见 Storybook 错误面板为 0；未覆盖的模式与平台仍保留。唯一实现修复为 Storybook 的 Rain 宿主字体继承；未修改主题颜色、基础组件或 r2 交付。
- N 补充 51 个去重选定 story 的指定路径，不是全库扫描。实际修复仅为 Storybook Rain body 正文色继承；Popover 3 节点原版 Light／Dark 的 color／font 恢复不扩展为其他状态。对比度低值、OTP 文案残留 I14 与 Autocomplete 指针打开后 Esc 焦点落 body 的 I15 继续保留。
- 目前不重新构建生产站、不消除历史索引差额、不运行重测试；后续应在用户允许的节奏下对最终冻结版本核验。全量对比度、跨浏览器／真实设备／辅助技术以及全新联网安装分别保留。
- Card／Surface 容器本身没有设计的 hover、disabled、invalid 状态，不额外创造；内部控件仍按各自状态核验。其他模块未查的状态不能写成不适用。
- 用户已确认的批改页、分批预览以及 Table／普通 Tabs 反馈只关闭各自确认范围；任意富文本、全库全部状态、生产发布与旧业务迁移不由此推导。已知问题和后续动作由 P5 问题记录单独跟踪。

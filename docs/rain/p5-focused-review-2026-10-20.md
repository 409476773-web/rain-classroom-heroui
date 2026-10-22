# P5 按钮、输入、选择与 Table／Tabs 定向复查

2026-10-20：已完成[本批清单](p5-next-review-batch.md)中的 4 个集中 story、5 个既有补充 story，以及文档站一个指定 Tabs 样本节点。发现并修复 **1 处 Storybook 宿主字体继承问题**。本轮是有限页面和路径的复查，P5 整体仍待验收。

## 来源与唯一实现变更

workspace 上游仍固定 HeroUI 3.2.6／`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`，Rain Theme 0.1.2。[开工摘要](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/source-before.json)记录 23 份输入；6006 服务工作目录为本 checkout 的 `packages/storybook`，页面实际响应了本轮 CSS 热更新。浏览器为应用内浏览器，工具未提供准确内核版本；不据此声称跨浏览器覆盖。

[Storybook globals.css](../../packages/storybook/.storybook/globals.css) 新增 Rain 根作用域下的 `#storybook-root` 字体继承。原因是 `preview-head.html` 对该容器硬编码 Inter，而既有主题绑定只覆盖 html／body。结果是 body 已用雨课堂字体，实际组件树却继续继承 Inter。

[修复前](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/buttons/font-inheritance-before.json)与[修复后](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/buttons/font-inheritance-after.json)均记录实际 body／host／button 字体；修复后 host 与按钮为 PingFang SC／Microsoft YaHei 栈。原版 Light／Dark 恢复原有 Inter。没有改品牌色、字体值、圆角值、基础组件或交互，也未重打包 r2。

另核对了 ListBox 父容器的黑色计算值：这些父容器不直接承载所测名称；实际 Label 已为 `#14233C`，危险文案为 `#B52A36`。[可见文字记录](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/selections/visible-label-colors.json)证明该情况没有形成新换肤问题，因此未追加颜色覆盖。

## 本批实际结果

| 组别                                                  | 已操作与观察                                                                                                                                                                                                                                                                                                                                              | 主要证据                                                                                                                                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button／ButtonGroup／ToggleButton／ToggleButtonGroup  | 查看 sm／md／lg、图标、四变体、横／纵／RTL／单项／detached／禁用；Rain 独立按钮及组外缘为 10px、连接内角归零。四变体真实 hover 有效，主按钮终值 `#0F52DC`；捕获真实按住的 pressed 状态及释放。Tab 跳过禁用项，Space 切换，三方向连接组与 detached 多选沿原版路径。                                                                                        | `buttons/rain-hover-variants-corrected.json`、`rain-pressed-real.json`、`rain-group-keyboard.json`、`rain-detached-and-group-states.json`                                                                         |
| Input／TextArea／SearchField／NumberField／InputGroup | 18 个实际带 placeholder 的节点为 `#A0ACC5`；六个持久前后缀为 `#56688F`。输入正文、多行反馈、清空及单位保留均实际操作。四族只读尝试未改值；记录禁用跳过及四种固定错误字段的真实聚焦。补看 InputGroup Invalid／Disabled，并对金额错误＋焦点取得三主题记录。                                                                                                 | `fields/rain-entered.json`、`rain-affixes-cleared.json`、`rain-invalid-focus.json`、`rain-readonly-and-disabled-skip.json`、`rain-readonly-additional.json`、`rain-price-focused.json`                            |
| Search／Number 原版机制                               | Search 的 Escape 和实际 Close 按钮均可清空并回到输入；清除按钮不进入 Tab 顺序，未新增焦点目标。Number 为 `18 → 18.5 → 18`，提交 20／0 后对应增／减按钮禁用。固定 `isInvalid` 未被改成输入后自动消失。                                                                                                                                                     | `fields/rain-search-clear.json`、`rain-number-step-bounds.json`                                                                                                                                                   |
| ListBox／Select                                       | 普通选中底 `#EAF2FF`、真实选中 hover `#DCE9FF`；方向键跳过周同学，Space 选择，点击当前选项可取消；多选只切换所操作项。禁用且已选保持选择和 0.5 opacity；危险语义保留。Select portal 继承 Rain；方向键跳过已归档项，Enter 更新值、Escape 关闭后均回触发器。Fields 的默认／secondary／错误 Select 可选择，禁用 Select 被 Tab 跳过。原版另重放关键键盘路径。 | `selections/rain-list-keyboard-and-selection.json`、`rain-selected-hover.json`、`rain-disabled-selected-click.json`、`rain-select-open.json`、`rain-select-keyboard.json`；`fields/rain-select-field-states.json` |
| Table 两变体                                          | Layouts 的表头／衬底保留 `#EBEFFF`、表头默认字色 `#7485A8`。两表实际选陈同学、全选三个可用项；禁用周同学不参与，方向键跳过，Space 改变选择。320px 容器承载 704px 表格，通过真实单元格操作滚至 384 再回 0；所测窄视口页面未横向溢出。                                                                                                                      | `table-tabs/rain-row-selection.json`、`rain-table-keyboard.json`、`rain-narrow-horizontal-scroll.json`                                                                                                            |
| Table 排序补充                                        | 既有 Default／SecondaryVariant 的 sortable Member 在真实 hover 时字色为 `#14233C`，移开恢复浅表头色；两次 Enter 为 descending／ascending，行 ID 顺序均与原版相同。secondary 原始整行文本中曾出现头像回退缩写随外部图片加载消失，未将它误判为排序变化。                                                                                                    | `table-tabs/table-primary-rain-sort.json`、`table-secondary-rain-sort.json` 及各自 `original-sort.json`、`rain-member-hover.json`／`rain-member-hover-left.json`                                                  |
| Tabs 长名／短名／文档                                 | 普通名称单行；实际溢出时 hover 设置完整原生 title，移出清除。非溢出的长名和 Overview 不加 title。禁用名称可获得相应 hover 提示，但点击不选择；方向键跳过禁用项，Home／End 保留。文档站仅取“用法”样本三标签的实际包装、字体和样式，与本地实现一致。                                                                                                        | `table-tabs/rain-tabs-hover-keyboard.json`、`rain-tabs-disabled-hover.json`、`tabs-short-rain-hover.json`、`tabs-short-rain-keyboard.json`、`docs-tabs-node.json`                                                 |

上表简写路径均位于[本轮独立证据目录](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/)。只读输入的错误状态是夹具固定属性，不代表真实业务校验流程。

## 最终对照与检查口径

[最终样式对照](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/style-comparison-final.json)使用固定外部视口 1280×960、侧栏 300，iframe 为 980×816。9 个入口共 **377 个取样节点**，原版 Light／Dark 共 **18 组恢复对照**，所取 style 字段差异为 0。14 项几何／排版／动作属性中，Rain 唯一差异为 Layouts 一处普通 Tabs label 从两行 40px 变为单行 20px，属于已授权规则；Tab 本身保持 32px。颜色、字体族和获授权圆角分别记录，不作为几何不变量。节点与字段数量不等于组件或完整路径数量。

- 最终文件选择由上述 JSON 的 `evidencePrefix` 指定。三个入口使用 `verified-*`，其余使用 `accepted-*`；这些是同一组固定入口的取样修正，不是全库扫描。
- 早期指针拖拽误触 Storybook 侧栏边界，曾改变预览宽度；已恢复开场的侧栏值 300，并在结束时撤销临时视口覆盖。不同视口的早期尺寸记录不并入最终几何比较。
- 少量早期文件在主题应用或 hover 过渡结束前取样；包括两个按钮 `accepted-*` 文件实际根主题与文件名不符，已由根主题确认、重置指针／局部状态及连续稳定读数的 `verified-*` 取代。失败和过渡文件原样保留，不按名称追认为通过。`rain-hover-variants-settled.json` 没有有效 hover，颜色结果采用 corrected 文件。
- [入口健康记录](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/entry-health.json)为 9 个指定入口可见错误面板 0；旧快照的 `errors` 包含隐藏通用帮助模板，不作为错误页。
- [控制台记录](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/console-review.json)中保留的最近记录为 49 条 warning、0 条 error，均为 Storybook 的快捷键配置弃用及未来 PopoverProvider ariaLabel 要求。该接口是当前 tab 的保留日志，不等于逐入口完整 pageerror 监听或全站无异常证明，未为消除工具告警改基础组件。
- [证据断言](../../evidence/runtime/rain-p5-focused-2026-10-20-r1/focused-checks.json)有 19 项通过，核对已有浏览器 JSON 中的颜色、步长、选择、排序 ID、焦点返回等；这是证据一致性检查，不是 19 条新组件测试。另有 3 个只读输入的补充键盘记录。

## 仍未覆盖

本轮没有启动测试套件、全 story 扫描、生产构建或依赖安装。TextArea 禁用、Input／TextArea secondary、InputGroup 只读不在现有 Fields 夹具中，不能宣称已检查；其他未走到的变体、loading、异步／虚拟化、日期／颜色／OTP、IME／自动填充、全部触控／RTL／缩放组合继续保留。

宿主 CSS 属于静态清单的输入，因此已刷新 inventory、例外清单、结构化目录和 AI 组件定位表，并通过 `local:catalog:check`。模块、示例和 story 数量均未改变；原有 9 个生产 story 差额及 4 个未直接注册文件继续保留。该刷新只同步源码摘要，不生成生产产物，也不把生成清单的运行状态改成通过。

默认态样式恢复与上述关键真实操作分别有证据；没有把 377 个节点解释为全部状态都逐一验证。Tabs 原生 title 只证明实际属性与溢出判断，不保证系统提示绘制时机、键盘 Tooltip 或读屏。浅提示／表头和 Tabs hover 的对比度、年份面板隐藏焦点、平台／辅助技术、r2 干净安装与全入口消费仍见 [P5 台账](p5-open-issues.md)。用户未新增全库视觉确认。

主题、基础组件、lockfile 和冻结交付包保持原样；本轮没有提交、推送、发布或迁移其他项目。

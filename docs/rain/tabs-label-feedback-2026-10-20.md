# 标签名称单行省略与完整提示

2026-10-20，用户明确要求标签页名称最多一行，过长显示省略号，悬停查看完整名称。此项是此前“保留原版几何与交互”约束下针对标签名的明确例外。

以下保留实现和定向验证时的记录；其中未审核／未打包的描述属于当时状态，最新用户确认与交付同步进度见末尾。

## 当前行为

- 雨课堂主题中，普通标签名最长 14em；容器更窄时可继续收缩。超长显示省略号，不换行，不增加 Tab 的 32px 高度。
- 悬停实际被截断的文字时，浏览器原生 `title` 展示全名；未截断的名称不增加提示，离开后清除临时 `title`。没有创建自定义 Tooltip、按钮或额外焦点目标；键盘聚焦不会弹原生标题提示，完整可访问名称仍保留。
- 禁用名称也能悬停查看全名，选择仍由原版 React Aria 禁用守卫阻止；方向键跳过禁用项。
- 只裁剪文字 span，Indicator、Separator、焦点环保持在外。普通原版主题不启用截断样式。
- 连续字符串、数字和纯文本 Fragment 合并成一个名称，避免动态拼接标题被拆成多个提示。含元素的 Fragment 保留结构；任意自定义富文本元素不被递归改写，布局仍由调用方管理。

## 本地源码例外

- `packages/react/src/components/tabs/tabs.tsx`：增加普通名称包装和仅在实际溢出时设置的原生提示，保留 RAC props、render-prop children 和集合结构。
- `packages/styles/src/components/tabs/tabs.styles.ts`：增加 `tabLabel` 语义类映射，不修改原版 CSS。
- `packages/rain-theme/index.css`：Rain 根作用域内添加单行与省略规则；允许禁用标签内的文字接收悬停，禁用选择机制仍在。
- `packages/storybook/.storybook/stories/rain-state-review-layouts.stories.tsx`：同步复查说明，不另写第二套组件。

预览：[表格、标签页与卡片](http://127.0.0.1:6006/?path=/story/components-theme-state-review--layouts&globals=heroui-theme:rain-light)。同轮表格衬底继续使用已核对旧库来源的 `#EBEFFF`，表头文字仍为 `#7485A8`。

## 实际定向验证

证据目录：`evidence/runtime/rain-tabs-label-2026-10-20/`。

- 新增 3 项 jsdom 用例，先确认未实现时失败；连续 Fragment／年份标题的缺口也单独确认失败后修复。最终与原有 7 项 Tabs 用例一起，10/10 通过，日志 `label-red.log`、`label-fragment-red.log`、`label-green.log`。
- 新用例覆盖实际溢出／不溢出时原生标题、移开清除、完整可访问名称、动态 children／Fragment／数字、Indicator 与自定义元素保留、禁用不能选及方向键跳过。
- 实际中文窄标签的文字区域为 189px、内容 196px、文字高度 20px、Tab 高度 32px；`white-space: nowrap` / `text-overflow: ellipsis`，原生 `title` 含完整名称。原版主题抽取的八个标签计算外观与尺寸前后一致，见 `original-before.json`、`original-after.json`、`hover-full.json`、`labels.json`。
- 实际操作验证方向键跳过禁用项；禁用项文字的悬停仍能提供完整标题，点击后该项保持未选、之前选中项不变，见 `disabled-hover.json`。
- 文档站 Tabs 页实际读取到相同名称包装与 Rain 单行规则，见 `docs.json`；两处预览都使用同一个本地实现。

这些结果是定向检查，不表示全库、跨浏览器或用户视觉审核通过。无新重测试、全库 story 扫描或生产构建。

## 交付边界

当前冻结的 0.1.1 交付保持原样，不包含本次 Tabs 本地补丁和表格配色；不能只复制新 CSS 到旧 JS 包就宣称能力完整。重新交付需要包含本地补丁的组件产物，再做相应消费核对。现有交付脚本的原版源码守卫保留，会阻止直接复用此前 JS 冒充新交付。本轮没有重新打包、提交、推送、发布或迁移其他项目。

## 用户限定确认与交付同步（2026-10-20）

用户随后回复：“确定。继续推进”。本次确认限定为当前预览中普通 Tabs 名称保持单行、超长显示省略号、悬停实际截断的文字时显示原生全名提示，以及同页表格衬底／表头背景 `#EBEFFF`、表头文字 `#7485A8`。任意自定义富文本标签不因此获得自动截断保证；完整 DOM 名称保留，键盘聚焦不弹原生 title 的边界不变。本次确认不扩展为全库所有状态、跨设备或产品生产验收。

新的私有交付已保存到 `delivery/rain-heroui-local-2026-10-20-r2/`：React／Styles `3.2.6-rain.1`（基于 HeroUI 3.2.6，含已授权 Tabs 补丁），雨课堂主题 `0.1.2`。组件 JS、样式语义槽、声明与主题 CSS 配套交付；三归档校验、独立导入、标签 SSR、Bundler 类型与 CSS 编译通过。6008 解包预览中，长名称在 149px 内单行省略（内容 406px／高度 20px），原生 title 为完整名称；方向键跳过禁用项，禁用名称可提供 title 且仍未选中。见 `consumer-verification.md` 与 `evidence/runtime/rain-delivery-r2-2026-10-20/`。原 `0.1.1` 冻结交付和历史证据保持原样。

新的重测试、全库 story 扫描与文档／Storybook 生产构建继续暂缓；本次不包含提交、推送、发布或其他工程迁移。全库最终验收和原有未解决限制仍单独记录。

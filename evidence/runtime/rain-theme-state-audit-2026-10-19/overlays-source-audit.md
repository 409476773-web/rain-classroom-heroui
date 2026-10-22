# 浮层与主题切换审查

日期：2026-10-19。版本：HeroUI 3.2.6。范围：Modal、AlertDialog、Popover、Tooltip、Dropdown、Toast、Drawer，及 CloseButton、文档站 / Storybook 主题根节点。没有修改组件源码或上游 CSS。

## 结论

本轮源码审查和 Chromium 编译 CSS 状态对照未发现新的浮层换肤缺陷。雨课堂色彩、字体与圆角按既有映射生效；遮罩、阴影结构、焦点环尺寸、禁用透明度、动画时间与退出时的点击穿透规则保持原版。

全库检查修复 success / warning 浅色底正文对比度后，浮层已同步复验：Toast 标题与 AlertDialog 状态图标准确读取 `--success-soft-foreground` / `--warning-soft-foreground`。这些角色保留 HeroUI 与正文色混合的公式，不再要求等于实心状态填充色；测试记录包含浏览器实际解析的状态文字颜色。

`node --test scripts/rain/overlay-state.test.mjs`：4 个测试通过。39 组记录、83 个元素 / 状态对照，详情见 `overlay-css-tests.log` 与 `overlay-css-states.json`。这些是使用真实编译 HeroUI CSS 的状态夹具，不能代替真实 React 浮层的焦点陷阱、滚动锁定、层级和关闭行为测试；真实交互由本轮主审查另行运行的 Rain browser suites 验证。

## 逐类结果

| 对象 | 已检查内容 | 结果与原版边界 |
|---|---|---|
| Modal / AlertDialog | 默认容器、触发器默认 / hover / 键盘聚焦 / pressed / disabled，透明 / opaque / blur 遮罩，进入 / 退出状态 | 容器为白色、雨课堂正文字色和字体，圆角 16px；遮罩颜色、模糊、布局、阴影结构和动效不变 |
| Popover / Dropdown | 容器、箭头、触发器各状态、进入 / 退出状态 | 容器和箭头都是白色；16px 圆角；退出时保持 pointer-events: none |
| Tooltip | 容器、箭头、触发器默认 / hover / 键盘聚焦，原生 disabled 夹具与 pressed 夹具，进入 / 退出状态 | 8px 圆角；白色箭头；退出不拦截点击；Tooltip 触发器本身无独立 disabled / pressed CSS，保持上游定义，不为它补造状态 |
| Toast | 默认容器、accent / success / warning / danger 标题、进入 / 退出状态 | 16px 圆角；语义标题使用雨课堂深色；通知的堆叠、动画与关闭策略不在主题层改写 |
| Drawer | 顶 / 底 / 左 / 右四方向容器、触发器各状态、三种遮罩、遮罩进入 / 退出 | 顶 / 底仅外露角 12px；左右仍无圆角；手势、布局和 motion 保持原版 |
| CloseButton | 默认、真实 hover、真实 Tab 聚焦、pressed hook、原生 disabled | 色彩读取主题；原版尺寸 / 圆形外观 / disabled 0.5 / 焦点环宽度保持 |

提示：pressed 采用 HeroUI 官方 `data-pressed` hook；默认 / hover / Tab / disabled 使用真实浏览器状态。进入 / 退出状态采用官方 data hooks。没有把静态夹具计为真实 React 事件验证。

## 源码依据

- `packages/styles/components/modal.css:179`、`alert-dialog.css:147`、`popover.css:5`、`dropdown.css:52`、`toast.css:47`：容器读取 `--overlay` / `--surface` 与 `--radius-3xl`；主题设置为白色与 16px。
- `packages/styles/components/tooltip.css:5`：读取 `--radius-xl`；主题为 8px。
- `packages/styles/components/drawer.css:154`：顶 / 底使用 `--radius-2xl`，左右 explicitly rounded-none；主题为 12px。
- `packages/styles/components/popover.css:44`、`dropdown.css:97`、`tooltip.css:44`：箭头 fill 使用 `--overlay`，不会遗留原版深色。
- `packages/styles/utilities/index.css:2`：焦点环由 box-shadow / ring 构成，需允许 ring 的颜色和 offset 背景随主题改变，同时验证尺寸和层数不变；不能把完整 box-shadow 字符串当成固定阴影断言。
- `packages/styles/utilities/index.css:61`：disabled opacity、cursor、pointer-events 是上游 token；主题没有重写。

## 主题切换与 Portal

- 文档站 `RainThemeProvider` 将主题标记放在 html，`CustomRootProvider` 通过 `forcedTheme="light"` 临时强制浅色，不覆盖原版 light / dark / system 偏好。body portal 可沿祖先继承；不用对子组件逐个包主题。
- `activateRainTheme()` 暂停现有品牌 token / 字体 style，退出恢复；布局、边框宽度、阴影与 spacing 留在原处。独立 `/themes` 和具体 showcase 路由暂停雨课堂，避免将主题编辑器内容与全局 portal 混为一个品牌。
- Storybook `applyPreviewTheme()` 同时同步根 class、data-theme 和雨课堂标记；Decorator 与 DocsContainer 均调用，覆盖 Canvas 与 MDX docs。manager chrome 继续用 Storybook 的浅色外壳。
- 已有单测覆盖还原 dark、保存/恢复选择、SSR hydration、独立路由和存储失败。未发现需修改的生命周期问题。

## 本轮明确未由此脚本验证的内容

- Safari、Firefox、移动端触摸拖拽、屏幕阅读器。
- 真实 Toast 堆叠的所有队列与 Promise 路径、Drawer 全方向实际拖拽。
- 所有生产页面的显式自定义颜色、内嵌 iframe / 图片 / 第三方内容。
- 文档 / Storybook 所有路由的人工逐屏视觉验收。这里只报告已记录的源码与编译 CSS 检查。

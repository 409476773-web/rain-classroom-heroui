# 雨课堂 HeroUI 主题

本私有主题版本为 0.1.2，搭配本地 React／Styles 归档 `3.2.6-rain.1`；源码上游基线仍为 HeroUI 3.2.6。颜色、字体身份与圆角来自既有雨课堂库；其余默认沿用 HeroUI 原版，用户明确要求的标签名截断例外见下文。该私有归档版本不是新的官方 HeroUI release。

在 Tailwind / HeroUI 样式入口后加载：

```css
@import "tailwindcss";
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";
```

在当前预览文档的 `html` 上使用 `class="light" data-rain-theme="light"`。移除 `data-rain-theme` 即撤销品牌变量；明暗模式由应用自身的主题控制器恢复。不要把根级主题放在组件外的一层普通 div 上，否则 portal 浮层不能可靠继承。不要同时启用其他品牌 preset 或内联颜色覆盖。

文档站和 Storybook 已处理上述切换、清理与明暗模式。常用入口见仓库 `docs/rain/README.md`。

可选关键数字字体：仅给数字及附着西文符号包裹 `<span data-rain-key-data>86.5</span>`，中文单位写在外侧。默认组件、表单和普通正文仍使用 UI 字体。不自动把全部数字换成关键数据字体，不附带字体文件；设备未安装时使用声明的回退字体。

当前雨课堂主题使用 10px 按钮圆角、浅灰蓝空值提示，以及 ListBox 选中项的浅品牌底色。按钮组保留连接处直角；头像、开关等保持原形状。移除主题标记会恢复原版外观。

表格衬底与表头背景为雨课堂既有浅蓝紫色 `#EBEFFF`，默认表头文字为 `#7485A8`，排序表头悬停仍使用正文色。覆盖只作用于 Rain 表格，不改变全局 `surface-secondary`、`muted` 或其他组件颜色。

雨课堂 Tabs 的普通文本名称保持单行，最长 14em，容器更窄时继续收缩，溢出显示省略号。悬停实际截断的文字时用浏览器原生提示展示全名，完整 DOM 文本保留。该能力依赖 `3.2.6-rain.1` 中的本地 Tabs 文本包装与样式语义槽补丁，不能仅将新 CSS 配到旧原版组件 JS。任意富文本自定义元素不被递归改写；原生 title 不增加键盘聚焦弹层，原有方向键和禁用守卫保留。

对应私有交付目录为 `delivery/rain-heroui-local-2026-10-20-r2/`。归档、源码指纹和实际定向消费结果以交付目录的 `README.md`、`manifest.json`、`report.json` 为准；本包说明不替代工程验证、全库状态或生产验收。旧 0.1.1 归档保留为历史冻结交付，不包含本次表格与 Tabs 更新。

映射、取舍与检查记录见 `docs/rain/theme-mapping.md`、`docs/rain/theme-acceptance.md` 和 `docs/rain/visual-feedback-2026-10-19.md`。本包目前为本地私有 workspace 包，没有发布。

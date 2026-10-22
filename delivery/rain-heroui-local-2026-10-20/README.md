# 雨课堂 HeroUI 本地交付

本目录是表格／Tabs 后续反馈前的历史冻结交付，归档、manifest 和 report 保持原样。最新交付见 [r2](../rain-heroui-local-2026-10-20-r2/README.md)：React／Styles `3.2.6-rain.1`、主题 `0.1.2`，包含用户确认的表格配色与本地 Tabs 补丁。下文限定检查只对应本目录当时的 0.1.1，不能作为 r2 的验证依据。

本目录为 0.1.1 冻结本地交付，尚未发布。HeroUI React / Styles 固定 3.2.6，雨课堂主题为 0.1.1。历史 0.1.0 归档保留在 `evidence/runtime/rain-consumer-2026-10-20/`，不再作为当前交付入口。

## 包与校验

`packages/` 包含三个归档；`manifest.json` 记录版本、SHA-256、固定上游提交和主题源码 SHA，`SHA256SUMS` 可在本目录执行 `shasum -a 256 -c SHA256SUMS` 核对。

将三个包复制到目标工程 `vendor/` 后安装：

```sh
pnpm add ./vendor/heroui-react-3.2.6.tgz ./vendor/heroui-styles-3.2.6.tgz ./vendor/rain-classroom-heroui-theme-0.1.1.tgz
```

安装仅为复制说明，本任务没有修改其他工程或发布包。请满足归档 package.json 声明的 peerDependencies：React / React DOM 19，Tailwind 4，以及对应 React Aria、日期工具依赖。使用既有工程的 Tailwind 4 构建集成与 TypeScript `moduleResolution: "Bundler"`；不要套用旧 NextUI / HeroUI v2 API。

## 复制示例

将 `example/App.tsx` 和 `example/App.styles.ts` 放入现有工程的同一目录。前者直接组合 Card、Form、TextField、Input、Button 和 Modal，后者只有业务布局；没有创建第二套基础组件。数据只在组件内预览，不发送、不保存。

将 `example/global.css` 的两个 import 合入全局样式入口，并根据实际文件位置调整 `@source`。字体、颜色和圆角只来自主题包。示例使用的 `tailwind-variants` 已是 HeroUI 的依赖；目标工程若采用严格依赖声明，应将 `tailwind-variants@3.3.1` 声明为直接依赖。

在页面 **html** 根节点启用主题（Next.js 放在根 layout 的 html）：

```html
<html lang="zh-CN" class="light" data-rain-theme="light">
```

全局样式顺序：

```css
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";
```

`example/index.html` 与 `example/main.tsx` 是普通 React / Vite 工程的挂载参考。已有应用只复制需要的入口内容，无需替换自己的路由或框架。Modal 内容通过 body portal 挂载，不能把主题标记只放在局部 div。

切回原版时移除 `data-rain-theme`，由应用主题控制器恢复原来的 light / dark 类；雨课堂当前仅支持浅色。字体使用系统字体与回退，未附带商业字体文件。

## 实际验证范围

归档导出存在、根 / 子路径导入、表单 / 卡片静态渲染、此示例 Bundler 类型检查（另含错误属性负例）和 CSS 编译结果记录在 `report.json`。类型声明仅在隔离副本按上游配置生成；复用固定版现有 JS，没有全库构建或扫描。

三个库从真实归档解包导入；第三方依赖复用本机现有版本。**这不是全新联网安装验证。** 上游无扩展名声明 barrel 的 NodeNext 兼容性未通过，当前结果针对前端 Bundler。

本机浏览器已定向验证：空提交显示错误并聚焦输入；有效输入打开 Modal，portal 正确继承主题；关闭后焦点返回提交按钮，输入保留。记录见工作区 `docs/rain/consumer-verification.md` 与 `evidence/runtime/rain-visual-batch-3-2026-10-20/delivery-browser.json`。不据此声称全部组件或全部浏览器验收完成。

交付内的 `consumer.html` / `consumer.css` 是验证产物，不是建议复制的页面实现。

上游根许可证原文另附于 `UPSTREAM-LICENSE`；根 LICENSE 与包元数据的许可标记差异保留，说明见工作区 `docs/rain/upstream-differences.md`。CalendarYearPicker 仍为上游进行中组件，第二批已记录的年份面板键盘焦点恢复限制没有在本次改动。

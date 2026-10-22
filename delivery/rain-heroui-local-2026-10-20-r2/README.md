# 雨课堂 HeroUI 本地交付 r2

本轮同步用户确认的表格与普通标签名称调整。HeroUI 上游源码基线仍为 3.2.6；两个组件包以私有本地版本 `3.2.6-rain.1` 标识已授权的 Tabs 补丁，雨课堂主题为 `0.1.2`。这些归档没有发布到注册表。此前 0.1.1 交付与原始校验记录完整保留。

## 复制与安装

将 `packages/` 下三个归档复制到目标工程 `vendor/`，按归档安装：

```sh
pnpm add ./vendor/heroui-react-3.2.6-rain.1.tgz ./vendor/heroui-styles-3.2.6-rain.1.tgz ./vendor/rain-classroom-heroui-theme-0.1.2.tgz
```

本任务没有安装或迁移其他工程。消费者仍需满足包内声明的 React / React DOM 19、Tailwind 4、React Aria 等 peerDependencies，并使用现有 Tailwind 4 集成。示例直接使用 `tailwind-variants`；严格依赖声明的工程应直接声明已锁定的 `tailwind-variants@3.3.1`。不使用旧 NextUI / HeroUI v2 API。

`manifest.json` 给出上游身份、实际归档版本、来源记录和 SHA-256。可在本目录运行 `shasum -a 256 -c SHA256SUMS` 核对归档。`patch-provenance.json` 记录旧归档、新源码与定向编译产物的关系，不能把本地后缀包当作未经修改的官方 3.2.6。

`verification-closeout.json` 记录最终示例文件、消费报告与浏览器证据的指纹，最终预览使用的示例与本目录文件逐字节相同。

## 复制组合示例

`example/App.tsx` 直接组合 Card、Tabs、Table、Form、TextField、Button 与 Modal；`App.styles.ts` 只放业务布局。记录与交互均为虚构页内状态，不发送、不保存。示例含 320px 标签容器、超长中文与禁用项，可查看本地补丁是否实际进入消费产物。

将这两份文件放在现有应用的同一目录。将 `example/global.css` 的导入合入应用全局样式，并调整其 `@source` 到真实文件位置：

```css
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";
```

在 **html 根节点** 设置 `class="light" data-rain-theme="light"`，让 body portal 浮层继承主题；不能只包一层局部 div。移除 `data-rain-theme` 可撤销 Rain 样式，由应用自己的控制器恢复原版明暗设置。当前 Rain 仅支持浅色，不附带商业字体文件。

`example/index.html` 与 `main.tsx` 是普通 React / Vite 挂载参考。已有项目只复制需要的内容，不替换原有框架或路由。

## 本轮变化与验证边界

- 表格衬底／表头背景为雨课堂已有 `#EBEFFF`，表头文字为 `#7485A8`；其余通用表面和文字角色保留。
- Rain 中普通 Tabs 名称单行、超长省略，悬停实际截断文字查看原生全名提示。指示器、完整可访问名称、方向键与禁用选择守卫保留。任意自定义富文本元素仍由调用方管理布局。
- Tabs JS、Styles 语义槽及其声明、Rain CSS 必须配套，不能只换旧包的 CSS。

工程消费检查结果以 `report.json` 为准，来源与编译范围见 `patch-provenance.json`。第三方依赖复用本机已有安装；不是全新联网安装。TypeScript 结果针对 Bundler；此前 NodeNext 声明解析限制仍保留。

本轮三个归档的 SHA 校验、独立根／子路径导入、Tabs 标签静态渲染与新样式槽、示例及负例类型检查、主题 CSS 编译均通过。包内主题 CSS 与冻结源码逐字节一致；原版 Tabs 定向编译基线经导入别名／顺序校准后与旧归档字节一致，保留原有共享模块，只替换授权模块及相应声明。

[独立归档预览](http://127.0.0.1:6008/) 已实际检查长标签、禁用与键盘切换、Table 新配色、空提交和 Modal。抽查时发现的示例错误提示残留已在示例业务状态中修正：空值／纯空白不打开浮层；编辑清除错误，有效提交后关闭浮层，输入保留且焦点回到“预览反馈”。没有改动 Form／TextField 等基础实现。浏览器证据在工作区 `evidence/runtime/rain-delivery-r2-2026-10-20/`；本机预览服务和临时目录不是可移植交付的一部分。

本轮只对已授权模块做隔离定向转译与消费验证，不运行全库重测、全库 story 扫描、文档站或 Storybook 生产构建。原版 CalendarYearPicker 的年份焦点恢复限制未修改。具体实际浏览器路径与待验证项见工作区 `docs/rain/consumer-verification.md`。

上游根许可证原文随附 `UPSTREAM-LICENSE`；根 LICENSE 与包元数据的许可标记差异保留，不自行重新定许可。

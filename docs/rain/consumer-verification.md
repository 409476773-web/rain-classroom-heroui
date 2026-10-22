# 本地包独立引用与当前交付

## 2026-10-21：r2 全 JavaScript 入口增量核对

[本轮证据](../../evidence/reviews/rain-p5-r2-imports-2026-10-21/README.md)复用原 r2 解包消费者，在 Node 24.13.0 中通过真实 specifier 串行执行 `import()`：React 87、Styles 85（含通配符实际子路径），共 **172／172** 成功。三个解包包的 1,203 文件与归档逐字节一致，归档摘要匹配，冻结交付目录 23 文件未变。

Theme 只有 CSS，不计 JS 入口；三个包没有声明 require 条件，未另行宣称 CJS 通过。这是对旧报告“导出目标存在 264／11／1”之外的真实 JS 导入补充，两种数量不可互换。第三方依赖仍复用本机已有安装；全新安装、全部行为、RSC、目标平台及 NodeNext 仍未由此验证。没有重打包、生产构建或修改旧 report。

## 当前交付：r2 私有归档与限定消费验证

2026-10-20，已生成 [`delivery/rain-heroui-local-2026-10-20-r2/`](../../delivery/rain-heroui-local-2026-10-20-r2/README.md) 的三个私有归档，并完成本轮限定消费与浏览器定向检查。源码上游仍固定 HeroUI 3.2.6 / `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`；私有版本不代表新的官方 release。

| 包                             | 私有版本     | 文件                                             |
| ------------------------------ | ------------ | ------------------------------------------------ |
| `@heroui/react`                | 3.2.6-rain.1 | `packages/heroui-react-3.2.6-rain.1.tgz`         |
| `@heroui/styles`               | 3.2.6-rain.1 | `packages/heroui-styles-3.2.6-rain.1.tgz`        |
| `@rain-classroom/heroui-theme` | 0.1.2        | `packages/rain-classroom-heroui-theme-0.1.2.tgz` |

r2 同时包含两个已授权的 Tabs 本地源码补丁、对应 JS／样式槽／必要声明与 Rain 主题新配色，不能用仅更新旧归档 CSS 的方式替代。归档版本、SHA 与源码指纹见 [`manifest.json`](../../delivery/rain-heroui-local-2026-10-20-r2/manifest.json)；逐项消费结果见 [`report.json`](../../delivery/rain-heroui-local-2026-10-20-r2/report.json)。

### 工程定向检查

- 从真实归档解包后的独立目录导入 React 根包、已测组件子路径及 Styles；三个被测库没有链接回 workspace 源码。
- React 的 264 个非通配符导出目标、Styles 11 个和主题 1 个具体导出目标存在。
- 表单／卡片静态 HTML 及 Tabs 标签 SSR 通过，实际消费到本地名称包装与 `tabLabel` 样式槽。
- 前端 Bundler 消费者、可复制示例和挂载入口类型检查通过；错误组件属性、错误布尔类型的负例保留，声明确实拒绝错误写法。
- Tailwind／PostCSS 从解包包编译 CSS 通过；解包主题 `index.css` 与本轮冻结源码 SHA-256 一致：`2349702bace822f597b8954e6dc312f7a70a69ed7b65e5c2cee25e672c3e69c6`。
- 两个 Tabs 入口在隔离副本定向编译；基线经记录的导入校准后与旧归档对应模块逐字节一致，可达共享模块保留原归档内容。仅替换明确列出的 Tabs JS／样式槽、必要声明与私有包元数据，没有全库重建。

源码、基线、产物 SHA 与替换清单见 [`patch-provenance.json`](../../delivery/rain-heroui-local-2026-10-20-r2/patch-provenance.json)。旧 0.1.1 归档、manifest、report 未被覆盖，旧包 SHA 核验仍通过。

### 从 r2 解包包运行的实际页面检查

本轮从 r2 的真实解包消费者启动仅本机预览：<http://127.0.0.1:6008/>。这不是 workspace 组件预览或旧 6007 快照；实际临时目录以更新后的 r2 `report.json` 为准，临时目录和本机服务不是可移植交付的一部分。

证据：[`browser-checks.json`](../../evidence/runtime/rain-delivery-r2-2026-10-20/browser-checks.json)、[`consumer-example.png`](../../evidence/runtime/rain-delivery-r2-2026-10-20/consumer-example.png)、[`consumer-modal.png`](../../evidence/runtime/rain-delivery-r2-2026-10-20/consumer-modal.png)。

| 范围           | 实际结果                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Tabs 长名称    | 文字区域 149px、内容 406px，单行高度 20px，Tab 高度 32px；ellipsis 生效，悬停原生 title 包含完整名称 |
| 短名称与禁用   | 短名称不增加 title；禁用名称可悬停读取全名但保持 `selected=false`；ArrowRight 可切换并跳过禁用项     |
| Table          | 衬底为 `rgb(235, 239, 255)`，表头文字为 `rgb(116, 133, 168)`，表体白色／正文 `rgb(20, 35, 60)`       |
| 空提交         | 显示反馈必填错误、焦点进入输入框，不打开 Modal                                                       |
| 有效提交与关闭 | 有效输入打开 Modal；返回编辑后无错误残留、`aria-invalid` 为空，输入值保留，焦点回到“预览反馈”        |
| Portal         | Modal 位于 body portal，白底、16px 圆角；“返回编辑”和主操作按钮保持 10px 圆角                        |

实际抽查发现接入示例在有效输入后仍残留旧错误提示。修复仅在 r2 `example/App.tsx` 的业务校验层：使用受控 `isInvalid` 与 `validationBehavior="aria"`，不改组件包或主题。随后重跑限定 `verify-consumer`，更新上述 `report.json`，并复查空提交、有效提交和关闭路径；`browser-checks.json` 的 `formAfterFix` 保存修复后结果。组件归档保持原样。

### 当前确认与未扩展范围

用户本次“确定。继续推进”只确认当前表格衬底／表头背景 `#EBEFFF`、表头文字 `#7485A8`，以及普通 Tabs 名称单行、省略和原生悬停全名提示。任意富文本标签、全库所有状态、完整可访问性或生产可用性不由这次确认推导；本轮新增的消费与页面检查同样只覆盖上述路径。

本轮没有新的重测试、全 story 扫描、文档／Storybook 生产构建、发布或其他工程迁移。第三方依赖复用本机已安装版本，不是全新联网安装验证。类型结果针对 `moduleResolution: "Bundler"`；历史 NodeNext 无扩展名声明 barrel 限制没有重跑或解决。CalendarYearPicker 原有年份面板关闭后焦点恢复限制继续保留，全库最终验收仍暂缓。

## 历史记录：0.1.1 冻结交付

以下保留 0.1.1 时点的版本、SHA、消费结果和当时交付边界。文中的“当前”“本轮”“尚未审核／尚未打包”均指该历史时点，不替代上方 r2 的最新记录。

当时边界（2026-10-20，r2 同步前）：0.1.1 归档是本次表格反馈前的冻结交付。表格衬底和表头字色已在 workspace 预览调整，尚未重新打包；现有归档、manifest 和 report 继续记录冻结版本，不能据此声称包内 CSS 与最新工作区源码一致。本轮新配色尚未记录用户审核。

后续 Tabs 单行省略与原生全名提示还包含本地组件源码补丁，同样不在该冻结交付中；只复制新 CSS 不能补齐旧组件 JS 的能力。当前源码差异与验证见 `tabs-label-feedback-2026-10-20.md`。

2026-10-20，在本次表格反馈前完成雨课堂主题的本地交付冻结。HeroUI React / Styles 继续固定 3.2.6，仅私有主题包从 0.1.0 升为 0.1.1。没有发布、安装其他项目、重新构建全库或执行全库浏览器扫描。

### 冻结交付入口（0.1.1）

目录：[`delivery/rain-heroui-local-2026-10-20/`](../../delivery/rain-heroui-local-2026-10-20/README.md)。可复制说明、示例、三个归档和校验清单放在同一个目录。

| 包                             | 版本  | 文件                                             |
| ------------------------------ | ----- | ------------------------------------------------ |
| `@heroui/react`                | 3.2.6 | `packages/heroui-react-3.2.6.tgz`                |
| `@heroui/styles`               | 3.2.6 | `packages/heroui-styles-3.2.6.tgz`               |
| `@rain-classroom/heroui-theme` | 0.1.1 | `packages/rain-classroom-heroui-theme-0.1.1.tgz` |

准确 SHA-256、版本、固定上游提交与主题源码 SHA 记录在 [`manifest.json`](../../delivery/rain-heroui-local-2026-10-20/manifest.json)。本次在交付目录执行 `shasum -a 256 -c SHA256SUMS`，三个归档全部通过。

冻结时的主题源码及解包后的 `index.css` SHA-256 完全一致：`3a681c04190cecbd82e8a096645d004438ab8e58ac109a3fc79f270432b0483d`。打包前后工作区 lockfile SHA 不变，第三方依赖版本没有改动。

历史 `evidence/runtime/rain-consumer-2026-10-20/` 保持原样，不覆盖原归档。该处 0.1.0 包内 CSS SHA 为 `435ab6865e5e6f1e8731bcc164433410a353ce19bef09428f6bb03a51660c94c`，已落后于当前源码，不能继续作为最新交付。

### 当时的限定检查

- 打包在隔离副本执行原版 prepack / postpack，工作区 React / Styles 源码和 package.json 不变；现有固定版 JS 直接复用。
- React 的 264 个非通配符导出目标存在，包括根入口、子路径、声明文件；Styles 11 个、Rain 1 个具体导出目标均存在。
- 消费者从真实 `.tgz` 解包后的独立目录导入 React 根包、`@heroui/react/button` 与 Styles，不把三个被测库链接回 workspace 源码。
- Card、Form、TextField、Label、Input、Button 静态 HTML 渲染通过。
- 可复制的 App、布局文件和挂载入口采用 Bundler 类型解析通过；另保留错误组件属性、错误布尔类型的负例，确认声明确实拒绝错误写法。
- Tailwind / PostCSS 从解包包编译示例全局 CSS，包含当前 10px 按钮和根主题规则；解包主题与冻结源码逐字节一致。
- 交付脚本语法、定向 ESLint、示例格式检查通过。

报告：[`report.json`](../../delivery/rain-heroui-local-2026-10-20/report.json)。静态 HTML / 编译 CSS 为交付目录内的 `consumer.html` / `consumer.css`。检查复用本机已安装的第三方依赖，**不是全新联网安装验证**。

### 当时的接入示例与独立消费者预览

复制交付目录 `example/` 下的 App、布局与全局样式到既有 React 工程，按 README 调整入口。直接使用 v3 的 Card、Form / TextField 和受控 `Modal.Backdrop`，不创建第二套基础组件、不套用旧版 ModalContent API。数据只在页面内预览。

全局样式：

```css
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";
```

在 **html** 启用 `class="light" data-rain-theme="light"`，使 body portal 同样继承；不在业务 div 上伪造局部全局主题。移除标记后由应用控制器恢复原版明暗模式。字体只声明系统字体与回退，没有新增字体二进制。

从隔离解包消费者启动了仅本机 Vite 开发预览：`http://127.0.0.1:6007/`。启动前端口空闲，使用 strictPort，不终止占用进程。配置复用本机 Vite 和第三方依赖，没有生产构建。实际临时路径见 `report.json`，进程信息见 `preview-process.json`；临时目录与本机服务不是可移植交付的一部分。

本轮实际浏览器定向抽查通过：空提交不会打开浮层，焦点进入反馈输入框并显示“请填写反馈”；填写“论点清楚，请补充观察数据。”后可打开 Modal。根主题为 rain light，主按钮为 `#1561F8` / 10px，空值提示为 `#A0ACC5`，中文字体栈正确；body portal 为白底 / 16px。点击“返回编辑”后浮层关闭，焦点回到“预览反馈”，输入内容保留。

证据：`evidence/runtime/rain-visual-batch-3-2026-10-20/delivery-browser.json`、`delivery-modal.png`、`delivery-example.png`。该结果只覆盖此交付示例的上述路径，不扩展为全库或跨浏览器验收。6007 预览保留，供本机继续查看。

### 当时的类型与安装边界

React 原有 `dist` 包含 JS，但缺少声明文件。当前交付在隔离副本按原版配置只生成声明，再打包核验；没有改写基础组件。workspace 协议也仅在临时包副本转换为实际版本。

TypeScript 结果针对上游采用的 `moduleResolution: "Bundler"`。历史额外 NodeNext 探针因上游无扩展名声明 barrel 未通过；本轮没有重复，也不声称 NodeNext 兼容。目标项目仍须满足包内 React 19、Tailwind 4、React Aria 等 peerDependencies 并配置 Tailwind 4。

示例布局直接使用 `tailwind-variants`；严格依赖声明的消费者请将 `tailwind-variants@3.3.1` 列为直接依赖。未执行全新依赖下载、真实业务迁移、生产部署或全部浏览器验收。

### 当时的后续定向复查说明

`pnpm local:consumer:check` 默认只输出到 `evidence/runtime/rain-consumer-check/`，不覆盖当前交付归档。`scripts/rain/prepare-delivery.mjs` 负责冻结主题后的新目录交付，拒绝覆盖已有 `packages/`；`scripts/rain/preview-consumer.mjs` 只预览已完成交付对应的临时解包消费者。两者均不运行全库生产构建。

以下继续保留首次 0.1.0 检查的原记录，作为历史依据。0.1.1 说明对应上述历史冻结交付，当前可复制、安装的版本与限定结果以上方 r2 记录为准。

## 历史记录：0.1.0 限定消费检查

2026-10-20，完成计划 P4 的限定产物消费检查。使用已有的固定版 JS 构建产物、在隔离副本生成的类型声明和当前雨课堂主题，没有运行全库构建、浏览器回归、联网依赖安装或发布。

### 可用本地包

位置：`evidence/runtime/rain-consumer-2026-10-20/packages/`。

| 包                             | 版本  | 文件                                    |
| ------------------------------ | ----- | --------------------------------------- |
| `@heroui/react`                | 3.2.6 | `heroui-react-3.2.6.tgz`                |
| `@heroui/styles`               | 3.2.6 | `heroui-styles-3.2.6.tgz`               |
| `@rain-classroom/heroui-theme` | 0.1.0 | `rain-classroom-heroui-theme-0.1.0.tgz` |

打包前复制包到临时目录，运行原版 prepack／postpack；原工作区的 package.json、React／Styles 源码和预览进程保持原样。临时副本将 workspace 协议改为对应实际版本，以便包可脱离本仓库被解析。

### 已验证

- 所有 React 非通配符导出共 264 个目标存在，包含根入口、组件子路径与类型文件；样式与主题包的具体导出目标也存在。
- 从解包后的独立目录导入 `@heroui/react` 和 `@heroui/react/button`；没有将这三个包链接回 workspace 源码。
- 独立消费者渲染 Card、Form、TextField、Label、Input、Button 的静态 HTML。
- 采用上游 React 工程同样的 `moduleResolution: Bundler`，消费者类型检查通过；错误组件属性和错误布尔类型确实被类型声明拒绝。
- PostCSS／Tailwind 从解包后的 `@heroui/styles` 和雨课堂包编译 CSS；当前 10px 按钮圆角与根主题规则包含在结果内。

完整报告和解析到的实际包路径：`evidence/runtime/rain-consumer-2026-10-20/report.json`。HTML 与 CSS 分别保存为 `consumer.html`、`consumer.css`。

### 发现与处理

现有 React `dist` 包含 JS 但没有声明文件，可能来自之前不带 `--tsc` 的快速构建。直接打包不能作为 TypeScript 交付，因此本次按原版 `scripts/generate-types.mjs` 的参数，仅在隔离副本生成声明，再打包并核验。没有改写基础组件。

临时目录中 pnpm 的相对 bin 包装路径不可用；检查脚本在副本内用绝对路径调用已安装的同一 `clean-package` 工具，仍执行原版打包钩子。

额外的 NodeNext 类型解析尝试未通过：上游声明的 barrel 使用无扩展名导出。本结果针对仓库原本采用的前端 Bundler 配置，不声称 NodeNext 声明兼容性通过。

### 在其他前端工程使用

将三个 `.tgz` 文件放到目标项目的 `vendor/` 目录后，可按以下形式安装：

```sh
pnpm add ./vendor/heroui-react-3.2.6.tgz ./vendor/heroui-styles-3.2.6.tgz ./vendor/rain-classroom-heroui-theme-0.1.0.tgz
```

目标工程应满足包中声明的 React 19、React Aria、Tailwind 4 等 peerDependencies，并配置 Tailwind 的构建集成。本次没有执行全新联网安装；隔离检查复用了本机已安装的第三方依赖，只将三个被测库从真实归档解包导入。

全局样式加载顺序与本次检查一致：

```css
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";
```

在 html 根节点启用雨课堂浅色：`class="light" data-rain-theme="light"`。业务组件继续从 `@heroui/react` 导入；主题根节点应同时覆盖 body portal。

TypeScript 采用前端项目的 `moduleResolution: "Bundler"`。字体身份沿用本机字体与回退；包未新增字体二进制。

### 复查

```sh
pnpm local:consumer:check
```

默认证据输出到 `evidence/runtime/rain-consumer-check/`。该命令不重新构建运行代码；要求现有 React／Styles `dist` 可用，缺失 React 类型时仅在临时副本执行声明生成。它验证特定表单／卡片消费路径及归档导出，不替代全库行为或生产验收。

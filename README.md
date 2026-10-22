# 雨课堂 HeroUI · 预览版

基于 **HeroUI 3.2.6、React 19、Tailwind CSS 4** 的雨课堂视觉改造版本。包含完整本地源码、中英文文档和示例、Storybook、AI 组件定位资料，以及可独立安装的配套归档。

**适合试用、设计组合和协作开发；P5 完整验收尚未结束。** 上传 GitHub 不代表全部状态、无障碍、跨平台或生产验收通过。

## 最快开始：运行独立示例

需要 Node.js 22.14 或更新版本、npm 和网络连接。不需要配置服务密钥。

```sh
git clone https://github.com/409476773-web/rain-classroom-heroui.git
cd rain-classroom-heroui/examples/rain-starter
npm install
npm run dev
```

打开终端显示的本机地址。示例使用仓库内的真实 r2 安装包，组合 Card、Table、Tabs、Form、Input、Button 与 Modal；所有记录和操作均为虚构页内状态，不连接真实课堂或成绩服务。

也可以[直接下载完整源码 ZIP](https://github.com/409476773-web/rain-classroom-heroui/archive/refs/tags/rain-v0.1.2-preview.1.zip)，或在 [Releases](https://github.com/409476773-web/rain-classroom-heroui/releases/tag/rain-v0.1.2-preview.1) 取得配套安装包，解压后进入 `examples/rain-starter` 执行后两条命令。安装、结构和检查范围见 [示例说明](examples/rain-starter/README.md)。本次没有验证全新网络安装；已验证的本机依赖复用范围单独记录。

## 用在已有 React 项目

从本仓库或 Release 取得以下三个配套归档，复制到目标项目的 `vendor/`：

```sh
npm install ./vendor/heroui-react-3.2.6-rain.1.tgz ./vendor/heroui-styles-3.2.6-rain.1.tgz ./vendor/rain-classroom-heroui-theme-0.1.2.tgz
```

满足包内声明的 React／React DOM 19、Tailwind 4、React Aria／日期依赖。示例另直接使用 `tailwind-variants`。不要从 npm 安装同名官方包后假定已包含本地 Tabs 补丁，也不要只换旧包 CSS。

在现有 Tailwind 4 集成的全局样式入口导入：

```css
@import "@heroui/styles";
@import "@rain-classroom/heroui-theme";

body {
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

在 **html** 设置 `class="light" data-rain-theme="light"`；portal 浮层才能继承主题。移除 `data-rain-theme` 可由应用原有控制器恢复 HeroUI 明暗主题。Rain 当前只有浅色。

```tsx
import {Button} from "@heroui/react";

export function Example() {
  return <Button>开始批改</Button>;
}
```

完整安装说明、SHA-256 和补丁来源见 [r2 交付](delivery/rain-heroui-local-2026-10-20-r2/README.md)。公开下载时请一并保留 `UPSTREAM-LICENSE`、来源和改动说明。

## 查看完整文档与 Storybook

从仓库根目录执行（使用 `.nvmrc` 对应的 Node 22.14；固定 pnpm 10.26.2）：

```sh
corepack enable
corepack prepare pnpm@10.26.2 --activate
pnpm install --frozen-lockfile --hoist
pnpm local:preview
```

- 文档／组件中心：<http://127.0.0.1:3100/cn/docs/react/rain>
- Storybook：<http://127.0.0.1:6006/>
- 文档顶部主题菜单、Storybook 的 HeroUI Light／HeroUI Dark／雨课堂 Light 支持切换对照。

启动器只监听本机，自动从安全示例创建本地环境配置，不覆盖已有配置；不需要上游生产密钥。完整开发环境的全新安装本次未重跑，故不以本机运行结果替代新环境验证。

## 源码与 AI 使用入口

| 内容 | 位置 |
| --- | --- |
| 原版组件实现及本地 Tabs 补丁 | [packages/react](packages/react) |
| 原版样式与 Tabs 语义槽 | [packages/styles](packages/styles) |
| Rain 颜色、字体和圆角 | [packages/rain-theme](packages/rain-theme) |
| 文档站与原版示例 | [apps/docs](apps/docs) |
| 主题对比、状态复查与批改示例 | [Storybook](packages/storybook/.storybook/stories) |
| AI 定位入口／规则 | [AI index](docs/rain/ai/index.md)、[usage-rules](docs/rain/ai/usage-rules.md) |
| 已确认批改组合 | [grading-panel](apps/docs/src/components/rain-examples/grading-panel) |

当前目录有 87 个源码模块、每语言 681 个注册示例；包含 compound parts 和辅助模块，不等于 87 个独立成熟组件均已完成验收。

## 当前状态

原版源码固定在 `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`。r2 为 React／Styles `3.2.6-rain.1`、Rain Theme `0.1.2`；归档尚未发布到 npm。已完成限定状态复查及 **172／172 个 ESM 入口真实导入**，不能将入口导入数量当作组件行为覆盖。

当前已知边界包括：浅提示／表头的低对比度、CalendarYearPicker 年份面板焦点、Autocomplete 指针打开后 Esc 焦点，以及 OTP 校验示例文案残留。完整回归、当前生产构建、全新安装和目标平台／读屏／触控仍待验证。

见 [P5 最新记录](docs/rain/p5-followup-review-2026-10-21.md)、[遗留问题](docs/rain/p5-open-issues.md)和[共享范围](docs/rain/github-sharing.md)。当前没有部署公开文档网站；`127.0.0.1` 链接需要先在自己的电脑启动。

## 来源与许可

本仓库是对 [HeroUI](https://github.com/heroui-inc/heroui) 的本地派生改造，不表示 HeroUI 或雨课堂官方发布／背书；不包含 HeroUI Pro、付费 Figma 素材或商业字体文件。

上游根 [LICENSE](LICENSE) 为 Apache-2.0，组件包元数据为 MIT；保留这一上游差异，不自行改写为统一许可。原始项目说明保留于 [upstream README](docs/upstream-README.md)。本地改动清单见 [改动说明](docs/rain/github-sharing.md)。品牌名称、商标和字体仍受各自权利约束。

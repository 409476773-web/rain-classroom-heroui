# 雨课堂 HeroUI：AI 入口

先读取本文件和 `usage-rules.md`。按任务在 [组件定位索引](components.md) 或 `apps/docs/src/generated/rain-catalog.json` 查找组件，再读对应本地文档、入口与 1–3 个示例；无需一次加载全库文档。

## 固定输入

- HeroUI React：3.2.6，固定提交 `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`。
- 私有 r2 交付已生成归档并完成限定消费验证：React／Styles `3.2.6-rain.1`、主题 `0.1.2`；包含本地 Tabs 两个源码补丁与表格配色。私有版本不改变上述上游基线。
- React 19、Tailwind 4；以本仓库 lockfile 为依赖依据。NextUI／HeroUI v2 的组件写法不适用于本版本。
- 唯一组件实现：`packages/react`；唯一原版样式：`packages/styles`。
- 唯一雨课堂主题：`packages/rain-theme/index.css`；主题作用在预览文档的 html，覆盖 body portal。
- 主题当前规则：10px 按钮、6px 输入框、16px 容器圆角；选中列表浅品牌底、浅灰蓝空值提示。详细来源见 `docs/rain/theme-mapping.md`，不要把这些值散写到业务页面。
- SearchField／NumberField 的空值提示同样使用浅灰蓝；InputGroup 固定前后缀使用辅助文字色。集中复查入口与实际验证范围见 `docs/rain/visual-review-batch-1-2026-10-20.md`，不据此推断全库状态或用户验收。
- 旧雨课堂项目只作品牌来源，不复制其组件实现，不修改旧项目。

用户后续明确要求的 Tabs 例外见 `docs/rain/tabs-label-feedback-2026-10-20.md`：Rain 中普通名称单行、超长省略、悬停截断文字查看原生全名提示。该能力包含本地 Tabs 源码补丁，完整名称和原版键盘／禁用守卫保留；旧 0.1.1 冻结交付不含此补丁，r2 已包含补丁产物并通过限定消费核对，不应只替换旧归档的 CSS 来假定新能力齐全。用户本次确认只覆盖当前表格 `#EBEFFF`／`#7485A8` 与普通 Tabs 名称反馈，不包括任意富文本、全库所有状态或生产验收。

Menu 独立样本和日历年份入口现已接入组件中心，记录见 `docs/rain/visual-review-batch-2-2026-10-20.md`。CalendarYearPicker 仍为上游进行中，须在 Calendar／RangeCalendar 内组合；年份面板关闭后的焦点恢复有原版已知限制，不能当作完整键盘验收通过。

## 最短定位路径

1. 找到组件的公开导入名、compound parts、本地源码和文档。
2. 读取文档示例，确认当前版本实际 API；表单优先看 Form、TextField、Label、Description、FieldError 的组合。
3. 保持基础组件的状态机制，在业务层组合卡片、列表、输入与浮层。
4. 用文档站查看用法，Storybook 查看原版／雨课堂的状态表现。两处均读取同一套 workspace 源码。
5. 报告改动和实际验证范围。源码完整、开发预览可运行、产物可消费、用户视觉审核分别记录。

## 已审核的业务样本

`apps/docs/src/components/rain-examples/grading-panel/`：同一份实现供文档和 Storybook 使用。

- `grading-panel.tsx`：列表、作答卡片、评分反馈表单、Popover 与确认 Modal。
- `grading-panel.model.ts`：虚构数据、分数／评语校验、学生草稿、显式提交。
- `grading-panel.styles.ts`：业务布局，窄容器自适应。
- `apps/docs/tests/grading-panel.test.ts`：单文件轻量逻辑检查。

用户已完成当前页面审核，以 10px 按钮圆角版本为准；记录在 `docs/rain/grading-example.md`。模拟提交不发布成绩、不调用服务、不通知学生。

## 日常命令与维护

```sh
pnpm local:preview
pnpm local:catalog
pnpm local:catalog:check
```

`local:catalog` 先刷新静态全库清单，再生成文档站目录与此处的定位表；不编译全部 stories。生成目录提供关联资料，不能据此标记组件已验收。

当前用户要求暂不运行新的重测试。允许单文件必要检查、定向代码检查及页面抽查；全库浏览器回归与生产构建留待后续明确安排。新增组件或基础行为变更需说明应补的验证范围，不能因为暂缓运行就声称已通过。

开发态 workspace 引用已用于文档站与 Storybook。打包后消费者的根／子路径导入、表单／卡片静态渲染、Bundler 类型解析及 CSS 编译已完成限定验证，见 `docs/rain/consumer-verification.md`；额外 NodeNext 类型解析不支持的情况与未执行的全新依赖安装均保留记录。

当前跨项目交付为 `delivery/rain-heroui-local-2026-10-20-r2/`：React／Styles `3.2.6-rain.1`，雨课堂主题 `0.1.2`。已生成私有归档并完成限定消费验证：根／子路径导入、Tabs 标签 SSR 与 `tabLabel` 槽、Bundler 示例与负例类型、CSS 编译通过，包内主题 CSS 与冻结源码 SHA 一致。Tabs 两个入口的基线定向编译与旧归档相符，共享模块保留；没有全库重建。实际消费与浏览器范围以 `docs/rain/consumer-verification.md` 及 r2 的 README、manifest、report 为准，不能据此推断全部状态或生产可用性。

旧 `delivery/rain-heroui-local-2026-10-20/` 的 0.1.1 归档、manifest、report 和此前定向结果保持原样，只证明当时冻结交付，不包含当前 Table／Tabs 更新。全库重验证、生产站构建和原有年份焦点限制继续分别记录。

## P5 验收定位

继续组件检查前，先查 [87 模块矩阵](../p5-component-matrix.md) 和 [遗留台账](../p5-open-issues.md)，再读 [最终验收总表](../../plans/2026-10-20-rain-p5-final-acceptance.md)。其中历史渲染、CSS fixture、真实交互、用户确认和当前产物验证分别记账，不因有源码或预览路由就标记全状态通过。

P5-I13 的[扫描工具准备](../p5-scan-preflight.md)已完成定向检查：必须显式指定新目录，默认并发 1，可先用 `--plan` 查看配置而不访问页面。不要直接复用旧审计命令；工具检查不代表真实扫描通过。4 个未注册中文示例已静态分类，保留源码且未新增入口。

[四组定向步骤](../p5-next-review-batch.md)中按钮、输入、选择、Table／Tabs 的 9 个既有入口已完成本轮指定路径，详见[定向复查报告](../p5-focused-review-2026-10-20.md)。最终默认态对照取样 377 个节点，18 对原版 Light／Dark 恢复的所取样式零差异；Rain 几何只比较列明的 14 属性，保留 1 处已授权 Tabs label 单行高度差。19 项为对既有浏览器证据的断言，不是新增组件测试；不能按节点数或断言数扩大覆盖。

20 日唯一实现修复为 `packages/storybook/.storybook/globals.css` 中 Rain `#storybook-root` 的字体继承。21 日[后续定向复查](../p5-followup-review-2026-10-21.md)完成 51 个选定 story 的指定路径，并基于实际可见文字修复 Rain body 的正文色继承；Popover 的原版 Light／Dark 所取颜色和字体恢复一致。主题 token、基础组件和 r2 归档不变；不要向基础控件散加字体或仅依据不直接承载文字的父容器颜色追加覆盖。

三处历史 release 引用已修复，三页 19 个预览实际渲染。r2 已补 172／172 ESM 入口真实导入（React 87、Styles 85；Theme 仅 CSS），但不是全新安装或全部行为通过。当前 placeholder／表头对比度低值、OTP 原版示例文案残留、Autocomplete 指针打开后 Esc 焦点落 BODY 均见 I04／I14／I15；不在业务示例中掩盖这些边界。CalendarYearPicker 的 I01 继续保留。

P5 仍待最终核验。全库状态、目标平台／辅助技术与未覆盖边界分别记账，新的重测试、全 story 扫描、依赖安装和生产构建继续暂缓。

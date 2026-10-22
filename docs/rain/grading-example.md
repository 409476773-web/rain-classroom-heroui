# 雨课堂批改面板业务组合

2026-10-19：新增一个可以操作的业务示例，使用已确认的雨课堂主题与 HeroUI 3.2.6 原版基础组件。

## 用户审核记录

2026-10-19 23:37（Asia/Shanghai），用户确认：“确定。已完成课堂练习批改页的审核”。本页当前版本已通过用户审核。

确认版本包括：选中作答的浅品牌底色、浅灰蓝输入提示、10px 按钮圆角，以及现有批改业务组合。对应 Storybook：`components-business-grading-panel--workspace`，主题：`rain-light`。最终视觉截图：`evidence/runtime/rain-feedback-2026-10-19/buttons-radius-10.png`。

审核范围为本页当前呈现与业务组合示例；全库、跨设备、无障碍及生产构建仍按各自验证记录记账。本次仅记录用户确认，没有运行新测试或修改实现。

## 预览入口

- [中文文档](http://127.0.0.1:3100/cn/docs/react/examples/grading-panel)：顶部「业务组合」，包含操作说明、组件映射与改造边界。
- [英文文档](http://127.0.0.1:3100/docs/react/examples/grading-panel)：英文说明，演示内容仍为中文。
- [Storybook 批改工作台](http://127.0.0.1:6006/?path=/story/components-business-grading-panel--workspace&globals=heroui-theme:rain-light)：Components → Business → Grading Panel → 批改工作台。

两处均沿用现有主题菜单。Storybook 链接默认选择雨课堂；文档站沿用使用者已保存的主题，可在顶部切换。

## 已实现的组合

左侧搜索／筛选作答，中间显示题目、评分参考和学生作答，右侧填写得分和反馈。宽容器三栏，中等容器两栏，窄容器按列表、内容、表单顺序排列。

- 6 位虚构学生，初始 2 份已批改；每个示例实例的数据独立。
- 每位学生分别保留当前页面内的草稿。搜索、筛选、切换作答不提交草稿。
- 得分要求 0–20，支持 0.5 分，0 分有效；评语必填且最多 500 字。无效提交显示 FieldError 并聚焦对应输入。
- Popover 提供评分参考和三条可插入的常用评语。
- Modal 先展示学生、分数和反馈；返回修改不更新进度，确认才提交。
- 提交后更新列表和进度，默认进入下一份匹配当前搜索的待批改作答；已提交结果只读。
- 搜索无结果与待批改清空均提供空状态；可回到全部作答。

这是本地交互示例。刷新重置，不保存到服务端、不发布成绩、不通知学生。真实服务的权限、保存、失败重试、并发与成绩发布不在本例范围内。

## 文件组织与边界

共享源码在 `apps/docs/src/components/rain-examples/grading-panel/`：

| 文件 | 职责 |
| --- | --- |
| `grading-panel.tsx` | HeroUI 组件组合、当前选择、浮层和操作反馈 |
| `grading-panel.model.ts` | 虚构数据、草稿隔离、校验、筛选与提交状态 |
| `grading-panel.styles.ts` | 仅业务排版和容器宽度响应式布局 |

文档 MDX 与 `packages/storybook/.storybook/stories/grading-panel.stories.tsx` 直接引用同一个 `GradingPanel`，没有两份实现。Storybook 的 Tailwind 扫描路径包含共享示例目录。

本例不加入基础组件 demo 注册表，也不增加基础组件包装。`packages/react`、`packages/styles` 没有修改；`packages/rain-theme` 的既有颜色、字体族和圆角映射继续使用。基础组件的阴影、尺寸、焦点、禁用与浮层机制仍由原版负责。

## 本轮验证

按用户要求仅做轻量检查，没有运行全库测试、所有 stories 扫描或生产构建。

- 单个业务逻辑测试文件：9 项通过；涵盖分数边界、必填评语、草稿隔离、显式提交、只读结果、筛选与下一份作答。
- 新增源码和 Storybook 入口的定向 lint 通过；Storybook 类型检查覆盖共享 TSX。
- 浏览器抽查：Storybook 与中文文档正常显示；空白报错、插入短语、切换后保留草稿、取消确认、确认后进度 2/6 → 3/6、自动进入下一份、只读回看、搜索空状态及恢复均已检查。
- Storybook 切换 HeroUI Light／雨课堂 Light，组合布局正常；320px 预览显示单栏且可滚动操作表单。
- 预览自带的无障碍面板显示雨课堂当前初始画面 0 项明确违规、1 项待人工判断；这不等于完整无障碍验收。本轮没有主动重新运行该扫描。

截图与轻量检查输出：`evidence/runtime/rain-grading-example-2026-10-19/`。`grading-panel.png` 为初始完整画布，`confirmation.png` 为提交确认，`docs.png` 为文档入口，`mobile-form.png` 为窄屏表单。

新增 story 后源码清单已更新。上一次生产构建仍是新增前的 587 个 stories，新增业务 story 尚未纳入生产产物；静态清单会如实列出这一项待构建差异。开发预览中的新增 story 已打开验证，不能据此声称生产构建已通过。

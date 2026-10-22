# 雨课堂浅色主题映射

工作区私有主题版本：`@rain-classroom/heroui-theme` 0.1.2，源码上游仍为 HeroUI 3.2.6。入口：`packages/rain-theme/index.css`。当前 r2 私有交付为 `delivery/rain-heroui-local-2026-10-20-r2/`，React／Styles 归档 `3.2.6-rain.1`，已生成包含本地 Tabs 补丁与表格新配色的私有归档，并完成限定消费验证；旧 0.1.1 冻结归档不包含这些更新。包内主题 CSS 与冻结源码 SHA 一致，实际范围见 [消费验证记录](consumer-verification.md) 和 r2 `report.json`。

用户本轮授权继续换肤。来源仍为 `brand-inputs.json` 所记录的 card-v2 当前工作树；实施前重新核对其中 12 份来源文件，摘要均匹配。原文件只读，未复制旧组件实现。

## 映射原则

优先使用旧库当前有效的 semantic；新分类值只在对应角色已迁移或已独立确认时采用。特别保留 `text-primary=#14233C`，不把它悄换为并存的 `Text/Neutral/1=#142346`。主操作、品牌文字、焦点分别使用三个不同蓝色。

主题原范围为颜色、字体族及圆角。除语义变量外，对按钮、三个 picker 浮层与主表格外壳精确映射 border-radius；2026-10-19 根据用户批注为普通 ListBox 选中项增加浅品牌底色，详见下文。2026-10-20 后续用户明确要求标签名“单行、省略、悬停全名”，本地 Tabs 因此增加文字包装和 Rain 截断规则，详见 [标签反馈记录](tabs-label-feedback-2026-10-20.md)。这一例外不改变其他组件大小、间距、字号、行高、字重、边框宽度、禁用透明度、阴影、动画与交互；基础组件的当前差异见 `upstream-differences.md`。

## 颜色

| HeroUI 角色 | 雨课堂值 | 旧库来源 / 本次角色选择 |
| --- | --- | --- |
| accent / accent-foreground | `#1561F8` / `#FFFFFF` | action-primary → Fill/Brand/Solid/2；text-inverse |
| accent-hover | `#0F52DC` | action-primary-hover |
| link / accent-soft-foreground | `#0F55DF` | action-primary-text → Text/Brand/1 |
| focus | `#3D7BFF` | focus-control / focus-item → Border/Brand/1 |
| foreground 及各表面前景 | `#14233C` | 当前仍有效的 text-primary |
| muted | `#56688F` | text-muted → Text/Neutral/4 |
| background | `#F2F4FF` | surface-page → Background/Neutral/3 |
| surface / overlay / field / segment | `#FFFFFF` | panel / overlay / inverse 白色表面 |
| surface-secondary | `#FAFCFF` | surface-raised；本次映射到第二表面 |
| surface-tertiary / default | `#EDF3FA` | surface-subtle；保持中性表面，不把普通控件全部染成品牌浅蓝 |
| rain-table-background | `#EBEFFF` | 旧库 Light `Background/Neutral/4`、`Fill/Neutral/Solid/4`；只读来源 `color-registry.ts:189–191`，用于本次表格衬底与表头的新角色映射 |
| rain-table-header-foreground | `#7485A8` | 旧库 Light Text/Neutral/5；只用于表头默认文字，不替换全局 muted |
| field-placeholder | `#A0ACC5` | 用户要求空白提示明显变浅；改用旧库 Text/Neutral/6，与正文、辅助文字区分 |
| border / separator | `rgb(16 63 183 / 16%)` | border-default / border-subtle → Border/Neutral/3 |
| accent-soft / hover | `#EAF2FF` / `#DCE9FF` | selection-item / selection-item-hover |
| success | `#18794E` | semantic-success |
| warning | `#A55B00` | semantic-warning |
| success-soft-foreground | HeroUI 原版 `color-mix(in oklab, success 80%, foreground 60%)` | 从已确认状态色与文字色派生，保留原版配方 |
| warning-soft-foreground | HeroUI 原版 `color-mix(in oklab, warning 80%, foreground 70%)` | 从已确认状态色与文字色派生，保留原版配方 |
| danger / soft-foreground | `#B52A36` | semantic-error；见危险操作合并说明 |
| success / warning / danger foreground | `#FFFFFF` | text-inverse；配合深色状态填充 |
| success-soft / hover | `rgb(20 181 101 / 10%)` / `18%` | 当前 semantic-success-surface → Fill/Green/Alpha/2；hover 映射同组 Alpha/1 |
| warning-soft / hover | `rgb(247 134 0 / 10%)` / `18%` | 当前 semantic-warning-surface → Fill/Orange/Alpha/2；hover 映射同组 Alpha/1 |
| danger-soft / hover | `rgb(243 72 72 / 10%)` / `18%` | 当前 semantic-error-surface → Fill/Red/Alpha/2；hover 映射同组 Alpha/1 |

状态填充的 hover 采用 `color-mix(in oklab, 状态色 90%, foreground 10%)`，在已有颜色间加深，以维持白色前景的可读性。这是本次 HeroUI 颜色映射，不冒称旧库的独立 hover token。其他衍生颜色沿用 HeroUI 的计算公式。

状态专项检查撤销了第一版 success/warning soft-foreground 与实体色相同的映射：警告 soft 标签叠在页面底色上曾降到 4.29:1。恢复原版混色配方后，成功/警告在页面及三档卡片表面、normal/hover 浅底上的最低对比度分别为 6.75:1 / 6.86:1。实体状态色、浅底及透明度不变；不是新增品牌原色。详见 `state-audit.md`。

取舍与不适合一对一搬运的角色：

- 首版占位文字采用辅助文字色 `#56688F`；用户反馈与正文区分不足，2026-10-19 改为旧库已有的浅灰蓝 `Text/Neutral/6 = #A0ACC5`。这是按最新视觉反馈作出的角色重映射，并非旧库 placeholder 原值。影响空值提示及原版共用该角色的部分图标、箭头、分隔线与光标；已输入内容和持久 Label／Description 不变。该浅提示色不记为正文对比度验收通过。
- 2026-10-20 补齐 SearchField／NumberField 专用输入的 placeholder 映射；InputGroup 持久前后缀（如 USD、https://）单独使用现有 `muted = #56688F`，避免随空值提示一起变淡。其余原版状态机制不变，详见 [本批视觉复查记录](visual-review-batch-1-2026-10-20.md)。
- HeroUI 的 danger 同时服务危险按钮和错误前景；第一版统一映射较深的 semantic-error `#B52A36`，没有另外给按钮强加旧 action-danger `#C93842`。
- HeroUI 主按钮 hover 和 pressed 共用 accent-hover。保留这一机制，不增加无效的 accent-pressed，也不改按下缩放。旧 pressed `#0B45B5` 不直接搬入。
- disabled 继续使用 HeroUI 原有透明度机制；不把旧禁用色覆盖所有内容。错误焦点继续使用 danger，普通焦点使用 focus。
- HeroUI 没有与旧库 info 完全等价的全局通用角色；不虚构一个已被全部组件消费的 info 变量。原版 Alert 等组件按其现有 accent/status 角色呈现。

普通 ListBox 选中项使用 `accent-soft = #EAF2FF`，选中并悬停时使用 `accent-soft-hover = #DCE9FF`。主题通过现有 `aria-selected` / `data-selected` 标记添加底色；保留勾选标记、键盘焦点与选择逻辑。此规则同样适用于 Select 等复用 ListBox 的选项，危险选项不强加品牌底色。

2026-10-20 按表格视觉反馈，在 Rain 根作用域为 primary 外壳及其表头、secondary 表头单元格使用 `rain-table-background`。第一轮曾使用 `#EDF3FA`；用户反馈不够接近雨课堂，希望再稍加深，第二轮改用旧库已确认的 `#EBEFFF`。所有表头单元格的默认文字仍使用 `rain-table-header-foreground = #7485A8`，排序表头悬停仍恢复原版 `foreground`。覆盖只落在表格元素，不在 Table 子树重定义通用变量：全局 `surface-secondary = #FAFCFF`、`surface-tertiary = #EDF3FA`、`muted = #56688F` 保持不变，其他组件不随之换色。默认表体仍为白色，行 hover／selected 的原版透明叠加、禁用透明度、焦点环、排序、虚拟化结构、尺寸、圆角、间距与交互均保持。用户本次已限定确认当前表格配色及普通 Tabs 名称反馈，不代表任意富文本或全库状态验收；r2 已生成私有归档并完成限定消费验证。逐轮来源与验证范围见 [表格反馈记录](table-feedback-2026-10-20.md)。

## 字体与圆角

UI/阅读字体：`"PingFang SC", "Microsoft YaHei", ui-sans-serif, sans-serif`。仅覆盖字体族，不复制旧项目的字号、行高或字重尺度。代码等显式 monospace 内容继续使用原版等宽字体。

关键数据可选字体：`"LINE Seed JP App_OTF", "SF Pro Rounded", ui-rounded, sans-serif`，通过 `data-rain-key-data` 显式使用，中文单位放在该元素之外。没有分发字体二进制；声明字体族不表示设备已安装指定字体。

| 角色 | 本次映射 | 说明 |
| --- | --- | --- |
| field-radius | 6px | Input、TextArea、Select trigger 等使用原版 field token 的部件 |
| rain-button-radius | 10px | Button、ToggleButton；按钮组仅外缘使用圆角，连接处仍为直角 |
| radius-xl | 8px | Tooltip 等直接读取此变量的浮层 |
| radius-2xl | 12px | 直接读取者；不是全局重定义 rounded-2xl utility |
| radius-3xl | 16px | Card、Modal、Popover、Select 面板等直接读取者 |
| 基础 radius / 原版 inline utilities | 保持原样 | Checkbox 的 6px、Radio 的 8px 已符合既有档位；Avatar、Switch、Chip 等保留各自形状 |

旧库确认的档位为 4/6/8/10/12/16/full，不要求每一个档位都强制用到。本次是这些已确认档位到 HeroUI 角色的新映射。

按钮最初参考旧库常规按钮设为 6px。用户随后反馈与 HeroUI 其他组件不协调，因此改用雨课堂既有圆角档位中的 10px：保留圆角矩形形态，同时与 16px 容器更协调。通过雨课堂根作用域映射 `.button` / `.toggle-button`，不改变所有元素的基础 radius。连接按钮组保留横向／纵向及 RTL 的外缘规则，分离式 ToggleButtonGroup 的每个按钮独立使用 10px。未扩展尺寸 API，输入框仍为 6px。

HeroUI 的 `@theme inline` 会将部分 `rounded-*` 编译为基准 radius 的倍数，而另一些容器直接读取 `--radius-3xl`。因此不缩小基准 `--radius`，也不全局重写 Tailwind 圆角规则；否则会连带改变圆形头像和单选框。全屏、贴边的 `rounded-none` 继续保持。

专项检查发现 DatePicker、DateRangePicker、ColorPicker 浮层和主表格外壳直接用基准半径的 2.5 倍，第一版仍为 20px。本主题通过根级作用域下的四个精确 BEM 类将它们映射到 `--radius-3xl`（16px）。次要表格不变。Tabs 的同类计算用于胶囊外壳，继续保留；没有全局修改基准 radius 或通用工具类。

## 两处预览如何保持一致

- 两处均导入同一个 CSS 包，主题标记位于各自预览文档的 html，body portal 能继承。
- 文档站在原有主题菜单增加「HeroUI 原版 / 雨课堂」，雨课堂使用独立保存键。启用时临时停用原 preset、vibrant 和主题编辑器颜色/字体覆盖，并强制亮色；切回恢复原 preset 与原明暗偏好。主题编辑器及独立 Showcase 详情页保留自身主题，返回文档恢复雨课堂选择，避免局部原版与 body 浮层混用。
- Storybook 顶部支持 HeroUI Light、HeroUI Dark、雨课堂 Light，写入 preview iframe 根节点。manager 和 Docs 面板外壳在雨课堂时使用浅色外壳。
- 原有示例、API 文档、源码入口和全部原版 stories 继续保留。新增 `Components/Theme/Brand Comparison` 仅为中文主题对照样本，不连接批改或保存服务。

只实现雨课堂浅色；原版深色仍可对比。多主题同时并排时应使用独立 iframe，不能在一个普通 div 里强行隔离根级主题。

官方颜色教学中的独立 light/dark 色板、显式自定义样式示例、图片及外部 iframe 仍展示它们自己的内容。主题覆盖语义变量的消费处，不强行覆盖这些示例的硬编码样式，也不改写示例源码来制造“全部像素已换色”的假象。

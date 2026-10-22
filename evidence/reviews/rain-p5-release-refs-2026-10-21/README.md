# P5-I06：三处历史发布文档示例引用修正

日期：2026-10-21。范围仅限三份明确列出的历史发布 MDX；未新增示例、注册别名、组件实现或依赖。

## 已修正

| 发布文档 | 旧引用／问题 | 当前处理与语义依据 |
| --- | --- | --- |
| `apps/docs/content/docs/en/react/releases/v3-0-0-alpha-34.mdx` | `text-field-basic` 未注册 | 使用已注册的 `textfield-basic`，与现存英文 TextField 用法文档及 `en/textfield/basic.tsx` 的邮箱字段组合一致。 |
| `apps/docs/content/docs/cn/react/releases/v3-0-0-alpha-34.mdx` | `text-field-basic` 未注册 | 使用已注册的 `textfield-basic`，指向中文 `cn/textfield/basic.tsx`，包含“邮箱／输入你的邮箱”。 |
| `apps/docs/content/docs/cn/react/releases/v3-0-4.mdx` | `text-typography-scale` 未注册，正文仍称 `Text` | 使用已注册的 `typography-typography-scale`；简介、段落及代码中的 `Text` 统一为当前公开组件 `Typography`，与同版本英文发布说明、组件文档、现存中文排版比例示例及公开 compound exports 一致。 |

历史版本号、发布日期、发布叙述、上游链接、安装说明和其余发布内容均保留。这里只修复当前本地文档的名称／注册引用，不重建当时的历史运行环境，也不推断旧版本 API。

## 已做的限定检查

- 三份文档共 19 个 `ComponentPreview` 引用均在对应语言注册表存在。
- 19 个注册项的 loader 目标源文件存在，且导出 loader 指定的函数／变量；没有使用英文回退替代中文示例。
- 三处缺失 ID 已从目标文档移除。
- 三份文档使用现有 `remark`／`remark-mdx` 完成语法解析。
- 变更前内容与 SHA：`source-before.json`；变更后摘要与完整引用对账：`static-reference-check.json`；限定语法结果：`mdx-parse-check.json`；精确变更：`changes.diff`。

## 待主任务进行限定页面验证

- <http://127.0.0.1:3100/en/docs/react/releases/v3-0-0-alpha-34>
- <http://127.0.0.1:3100/cn/docs/react/releases/v3-0-0-alpha-34>
- <http://127.0.0.1:3100/cn/docs/react/releases/v3-0-4>

检查点：相应 TextField／Typography 预览实际渲染，页面不出现未注册 demo 提示；中英文 alpha.34 分别展示对应语言邮箱标签。中文 v3.0.4 的 Typography 比例示例包含 h1–h6、body／body-sm／body-xs、code。

未运行浏览器、测试套件、全库扫描、生产构建、依赖安装或 Git 操作。当前报告只证明三份文档的静态引用与语法；对应页面的运行结果待主任务补充，不据此关闭全库验收。

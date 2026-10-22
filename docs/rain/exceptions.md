# 全库静态清单例外与待核验项

> 由 `node scripts/rain/inventory.mjs` 生成，请修改来源或生成器后重建。此文件不记录人工视觉接受。

基线：`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`，包版本 `3.2.6`。

## 状态边界

- 已完成：源码、导出、文档、demo 注册和 stories 的静态交叉分析。
- Storybook 产物索引对账：`mismatch`，660 entries / 587 stories；实际 ID 记录在 inventory.json，构建索引不证明运行通过。
- 索引来源：`historical-reference`（`docs/rain/storybook-baseline-index.json`）；历史参考不代表当前生产构建，本静态生成器不验证当前生产产物。
- 本生成器不执行：打包后 exports、demo/story 运行、交互、主题和人工视觉验收；独立验证结果见 acceptance.md。
- `referenced-by-parent-or-composition-story` 仅代表源码存在 import/JSX 证据；`parent-implementation-linked-to-story` 表示父实现引用了该部件并有 story。二者都不代表所有状态已覆盖。
- 公开支持模块、helper 和 in-progress 组件均保留；rootExported 仅描述根导出，不能据此断言没有发布子路径。
- 中文在仓库中使用 `cn`，清单语言字段使用 `zh`；回退英文不算中文覆盖。

## 没有独立 story 的模块

| 模块 | 静态处置 | 参考证据 |
|---|---|---|
| calendar-year-picker | parent-implementation-linked-to-story | 父实现关联：`packages/react/src/components/calendar/calendar.stories.tsx`; 父实现关联：`packages/react/src/components/range-calendar/range-calendar.stories.tsx`; AGENTS.md marks this in progress; public exports are retained and must not be treated as fully accepted. |
| color-input-group | support-or-internal-module | 父实现关联：`packages/react/src/components/color-field/color-field.stories.tsx`; AGENTS.md identifies this as a helper and the root barrel omits it; prepack may still expose a subpath, requiring packed-export verification. |
| date-input-group | support-or-internal-module | 父实现关联：`packages/react/src/components/date-field/date-field.stories.tsx`; 父实现关联：`packages/react/src/components/time-field/time-field.stories.tsx`; AGENTS.md identifies this as a helper and the root barrel omits it; prepack may still expose a subpath, requiring packed-export verification. |
| description | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/avatar-group/avatar-group.stories.tsx`; `packages/react/src/components/button-group/button-group.stories.tsx` |
| empty-state | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/combo-box/combo-box.stories.tsx`; `packages/react/src/components/table/table.stories.tsx` |
| error-message | referenced-by-parent-or-composition-story | `packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx` |
| field-error | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/checkbox-group/checkbox-group.stories.tsx`; `packages/react/src/components/checkbox/checkbox.stories.tsx` |
| form | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/card/card.stories.tsx`; `packages/react/src/components/checkbox-group/checkbox-group.stories.tsx` |
| header | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/combo-box/combo-box.stories.tsx`; `packages/react/src/components/dropdown/dropdown.stories.tsx` |
| icons | support-or-internal-module | `packages/react/src/components/link/link.stories.tsx`; AGENTS.md identifies icons as internal/support; its root exports remain in the public API inventory. |
| label | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/react/src/components/avatar-group/avatar-group.stories.tsx`; `packages/react/src/components/button-group/button-group.stories.tsx` |
| list-box-item | parent-implementation-linked-to-story | 父实现关联：`packages/react/src/components/list-box/list-box.stories.tsx`; AGENTS.md identifies this as a parent-covered part of ListBox. |
| list-box-section | parent-implementation-linked-to-story | 父实现关联：`packages/react/src/components/list-box/list-box.stories.tsx`; AGENTS.md identifies this as a parent-covered part of ListBox. |
| menu | referenced-by-parent-or-composition-story | `packages/storybook/.storybook/stories/rain-state-review-menu.stories.tsx` |
| menu-item | parent-implementation-linked-to-story | 父实现关联：`packages/react/src/components/dropdown/dropdown.stories.tsx`; AGENTS.md identifies this as a parent-covered part of Menu/Dropdown. |
| menu-section | parent-implementation-linked-to-story | 父实现关联：`packages/react/src/components/dropdown/dropdown.stories.tsx`; AGENTS.md identifies this as a parent-covered part of Menu/Dropdown. |
| rac | support-or-internal-module | `packages/react/src/components/color-area/color-area.stories.tsx`; `packages/react/src/components/color-field/color-field.stories.tsx`; `packages/react/src/components/color-slider/color-slider.stories.tsx`; AGENTS.md identifies rac as an internal/support module; preserve its public re-exports, not a standalone visual family. |
| radio | referenced-by-parent-or-composition-story | `packages/react/src/components/avatar-group/avatar-group.stories.tsx`; `packages/react/src/components/modal/modal.stories.tsx`; `packages/react/src/components/radio-group/radio-group.stories.tsx` |
| tag | referenced-by-parent-or-composition-story | `packages/react/src/components/autocomplete/autocomplete.stories.tsx`; `packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx` |

## 注册、源码和文档引用问题

- **missing_built_story** — `packages/storybook/.storybook/stories/grading-panel.stories.tsx`：Workspace
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-buttons.stories.tsx`：Buttons
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-calendar.stories.tsx`：CalendarNavigation
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-fields.stories.tsx`：Fields
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-layouts.stories.tsx`：Layouts
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-menu.stories.tsx`：Menu
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx`：Overlays
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx`：ErrorMessages
- **missing_built_story** — `packages/storybook/.storybook/stories/rain-state-review-selections.stories.tsx`：Selections

## 已注册的源码包装器

下列 loader 与展示源码文件不同，但 loader 中存在指向该源码的动态导入。它们是已有包装映射，不能误算成漏注册示例；运行结果仍未验证。

- `en:date-picker-format-options`：`apps/docs/src/demos/en/date-picker/format-options-no-ssr.tsx` → `apps/docs/src/demos/en/date-picker/format-options.tsx`
- `en:date-range-picker-format-options`：`apps/docs/src/demos/en/date-range-picker/format-options-no-ssr.tsx` → `apps/docs/src/demos/en/date-range-picker/format-options.tsx`
- `zh:date-picker-format-options`：`apps/docs/src/demos/cn/date-picker/format-options-no-ssr.tsx` → `apps/docs/src/demos/cn/date-picker/format-options.tsx`
- `zh:date-range-picker-format-options`：`apps/docs/src/demos/cn/date-range-picker/format-options-no-ssr.tsx` → `apps/docs/src/demos/cn/date-range-picker/format-options.tsx`

## 未直接注册的 demo TSX 文件

以下可能是被导入的辅助文件、历史示例或漏注册项；不自动删除或判为错误。

- `apps/docs/src/demos/cn/close-button/variants.tsx`
- `apps/docs/src/demos/cn/link/underline-offset.tsx`
- `apps/docs/src/demos/cn/link/underline-variants.tsx`
- `apps/docs/src/demos/cn/skeleton/card.tsx`

## 语言回退和文档可达性

本次未发现文档 demo 引用回退英文；其余中文文字质量未审阅。

已注册但未被 React MDX 的 ComponentPreview/ComponentSource 直接引用：0 项。完整条目可按 inventory.json 的 referencedByDocs 空数组检索；它们仍全部保留。

## 独立核验事项（结果另见 acceptance.md）

1. 从打包产物核验公开 exports 与 CSS 资源，不能用开发态 package.json 代替。
2. 每次重建 Storybook 后重新生成清单，对账 index.json 实际 ID、导出与 ready-only 配置；不猜测正式 ID。
3. 加载全部注册 demo/story，分类记录外部资源、控制台、交互与主题问题。
4. 对全部组件族及适用状态建立视觉审阅记录，另记用户接受范围。

外部资源与本地环境的具体运行问题由 P1 运行证据记录；本生成器不尝试联网，也不证明完全离线可用。

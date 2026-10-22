#!/usr/bin/env node
/* eslint-disable no-console -- This generator reports catalog freshness. */
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const GROUPS = {
  buttons: "按钮",
  collections: "列表与集合",
  colors: "颜色",
  controls: "选择控件",
  "data-display": "数据展示",
  "date-and-time": "日期与时间",
  feedback: "状态反馈",
  forms: "表单",
  layout: "布局与容器",
  media: "媒体",
  navigation: "导航",
  overlays: "浮层",
  pickers: "选择器",
  supporting: "组合部件与辅助模块",
  typography: "文字",
  utilities: "辅助工具",
};
// Explicit local review routes, checked against source inventory before use.
// They do not change actualStoryIds or claim inclusion in the older production build.
const LOCAL_PREVIEWS = {
  "calendar-year-picker": {
    descriptions: {
      cn: "上游进行中；通过 Calendar 公开部件组合使用。年份面板关闭后的键盘焦点恢复存在已知限制，尚未完成稳定性和全部状态验收。",
      en: "Upstream work in progress; compose through Calendar public parts. Keyboard focus restoration after closing the year panel has a known limitation. Stability and full-state acceptance are still pending.",
    },
    exportName: "CalendarNavigation",
    file: "packages/storybook/.storybook/stories/rain-state-review-calendar.stories.tsx",
    group: "date-and-time",
    id: "components-theme-state-review--calendar-navigation",
    titles: {cn: "CalendarYearPicker 年份选择（进行中）", en: "CalendarYearPicker (in progress)"},
  },
  "error-message": {
    exportName: "ErrorMessages",
    file: "packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx",
    id: "components-theme-state-review--error-messages",
  },
  menu: {
    descriptions: {
      cn: "独立菜单的本地状态复查：普通项、单选、多选、禁用、危险项和页内操作反馈；预览可用不代表全状态验收。",
      en: "Local standalone menu review: actions, single and multiple selection, disabled and danger items. Preview availability is not full-state acceptance.",
    },
    exportName: "Menu",
    file: "packages/storybook/.storybook/stories/rain-state-review-menu.stories.tsx",
    group: "collections",
    id: "components-theme-state-review--menu",
    titles: {cn: "Menu 菜单", en: "Menu"},
  },
};
const unique = (items) => [...new Set(items)];
const canonical = (route) => route.replace(/^\/en\//, "/");
const examplePriority = (id) => (/-(basic|default)$/.test(id) ? 0 : /custom/.test(id) ? 2 : 1);

export function createCatalog(inventory, readSource = () => "") {
  const documentByFile = new Map(inventory.documents.map((doc) => [doc.file, doc]));
  const storyByFile = new Map(inventory.stories.map((story) => [story.file, story]));
  const demoById = new Map(inventory.demos.map((demo) => [demo.id, demo]));
  const related = new Map();

  for (const demo of inventory.demos) {
    for (const reference of demo.references ?? []) {
      const documents = related.get(reference.module) ?? [];

      documents.push(...(demo.referencedByDocs ?? []));
      related.set(reference.module, documents);
    }
  }
  const entries = inventory.modules
    .map((module) => {
      const localPreview = LOCAL_PREVIEWS[module.id];
      const localStory = localPreview && storyByFile.get(localPreview.file);

      if (
        localPreview &&
        (!localStory?.exportNames?.includes(localPreview.exportName) ||
          !localStory.references?.some(
            (reference) =>
              reference.module === module.id ||
              (module.id === "calendar-year-picker" && reference.module === "calendar"),
          ))
      ) {
        throw new Error(`本地复查映射缺少文件、导出或实际组件引用：${module.id}`);
      }
      const values = unique(
        module.exports.filter((item) => item.kind === "value").map((item) => item.name),
      );
      const isSupport = module.kind === "public-support-module";
      const name = isSupport
        ? module.id
        : (values.find((value) => /^[A-Z]/.test(value)) ?? module.id);
      const own = (locale) =>
        module.docs[locale]
          .map((file) => documentByFile.get(file))
          .find((doc) => doc?.kind === "component");
      const relatedDocs = unique(related.get(module.id) ?? [])
        .map((file) => documentByFile.get(file))
        .filter((doc) => doc?.kind === "component")
        .sort(
          (a, b) =>
            Number(b.owner?.startsWith(`${module.id}-`)) -
            Number(a.owner?.startsWith(`${module.id}-`)),
        );
      const docs = {};
      const examples = {};
      const titles = {};
      const descriptions = {};

      for (const [locale, repositoryLocale] of [
        ["cn", "zh"],
        ["en", "en"],
      ]) {
        const chosen =
          own(repositoryLocale) ??
          own("en") ??
          relatedDocs.find((doc) => doc.locale === repositoryLocale) ??
          relatedDocs[0];
        const isRelated = !!chosen && chosen.owner !== module.id;
        const language = chosen?.locale === "zh" ? "cn" : "en";

        docs[locale] = chosen
          ? {
              file: chosen.file,
              href: canonical(chosen.route),
              language,
              related: isRelated,
            }
          : null;
        titles[locale] = !isRelated && chosen ? chosen.title : name;
        descriptions[locale] =
          !isRelated && chosen
            ? (readSource(chosen.file)
                .match(/^description:\s*(.+)$/m)?.[1]
                ?.replace(/^["']|["']$/g, "") ?? "")
            : "";
        examples[locale] = [...(chosen?.demoIds ?? [])]
          .sort((a, b) => examplePriority(a) - examplePriority(b))
          .map((id) => {
            const reference = chosen.demoReferences?.find((item) => item.key === id);
            const demo = demoById.get(reference?.resolvedId ?? `${chosen.locale}:${id}`);

            if (
              !demo ||
              (isRelated && !demo.references?.some((reference) => reference.module === module.id))
            ) {
              return null;
            }

            return {id, language: demo.locale === "zh" ? "cn" : "en", source: demo.sourcePath};
          })
          .filter(Boolean)
          .slice(0, 3);
      }
      if (localPreview) {
        Object.assign(titles, localPreview.titles);
        Object.assign(descriptions, localPreview.descriptions);
      }
      const relatedStory =
        [...(module.parentStoryIds ?? [])]
          .map((id) => ({
            file: inventory.stories.find((story) => story.actualStoryIds?.includes(id))?.file,
            id,
          }))
          .find((story) => story.file) ??
        (module.referencedByStories ?? [])
          .map(({file}) => ({
            file,
            id: storyByFile.get(file)?.actualStoryIds?.[0],
          }))
          .find((story) => story.id);
      const ownId = module.storyIds?.[0];
      const storyFile = ownId
        ? inventory.stories.find((story) => story.actualStoryIds?.includes(ownId))?.file
        : relatedStory?.file;
      const storyTitle = storyByFile.get(storyFile)?.title;
      const primaryDoc = own("zh") ?? own("en");
      const groupFromDoc = primaryDoc?.file.match(/\/components\/\(([^)]+)\)\//)?.[1];
      const relatedGroup = docs.cn
        ? documentByFile.get(docs.cn.file)?.file.match(/\/components\/\(([^)]+)\)\//)?.[1]
        : undefined;
      const group =
        localPreview?.group ??
        (isSupport
          ? "supporting"
          : (groupFromDoc ??
            relatedGroup ??
            storyTitle?.split("/")[1]?.toLowerCase().replaceAll(" ", "-") ??
            "supporting"));
      let story =
        ownId || relatedStory?.id
          ? {file: storyFile, id: ownId ?? relatedStory.id, related: !ownId}
          : null;

      if (localPreview) {
        story = {
          file: localPreview.file,
          id: localPreview.id,
          localReview: true,
          related: !localStory.references.some((reference) => reference.module === module.id),
        };
      }

      return {
        descriptions,
        docs,
        examples,
        exports: values,
        group,
        groupLabel: {cn: GROUPS[group] ?? GROUPS.supporting, en: group.replaceAll("-", " ")},
        id: module.id,
        implementation:
          module.source.files.find(
            (file) => file.endsWith(".tsx") && !file.includes(".stories."),
          ) ?? module.source.entry,
        importName: module.rootExported && !isSupport && /^[A-Z]/.test(name) ? name : null,
        name,
        parts: module.compound.flatMap((compound) =>
          compound.members.map((member) => `${compound.name}.${member.name}`),
        ),
        public: module.rootExported,
        source: module.source.entry,
        story,
        styles: module.styles.css,
        titles,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return {
    commit: inventory.upstream.commit,
    counts: {
      componentDocs: inventory.documents.filter(
        (doc) => doc.kind === "component" && doc.locale === "zh",
      ).length,
      publicModules: entries.filter((entry) => entry.public).length,
      registeredDemos: inventory.demos.filter((demo) => demo.locale === "zh").length,
      sourceModules: entries.length,
    },
    entries,
    generatedBy: "scripts/rain/catalog.mjs",
    inventorySha256: inventory.upstream.inputSha256,
    schemaVersion: 1,
    version: inventory.upstream.packageVersion,
  };
}
function renderIndex(catalog) {
  return [
    "# 本地组件定位索引",
    "",
    `自动生成：\`${catalog.generatedBy}\`；HeroUI ${catalog.version}，提交 \`${catalog.commit}\`。`,
    "",
    "先读 index.md 与 usage-rules.md，再按任务读取下表中的入口及 1–3 个示例。完整结构化目录位于 apps/docs/src/generated/rain-catalog.json。",
    "",
    "目录包含公开模块和内部辅助模块；没有公开导入建议的条目不要自行拼接 @heroui/react 子路径。组合文档／story 只说明引用关系，不等于该模块已有独立演示或验收。",
    "",
    "| 模块 | 根包导入 | 本地源码 | 文档 | Storybook |",
    "| --- | --- | --- | --- | --- |",
    ...catalog.entries.map(
      (entry) =>
        `| ${entry.id} | ${entry.importName ?? (entry.public ? "辅助导出，查入口" : "内部辅助")} | ${entry.source} | ${entry.docs.cn?.file ?? "无独立文档"}${entry.docs.cn?.related ? "（组合引用）" : ""} | ${entry.story?.id ?? "无独立 story"}${entry.story?.related ? "（组合引用）" : ""}${entry.story?.localReview ? "（本地复查）" : ""} |`,
    ),
    "",
  ].join("\n");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const read = (file) => readFileSync(path.join(root, file), "utf8");
  const catalog = {
    ...createCatalog(JSON.parse(read("docs/rain/inventory.json")), read),
    workspaceRoot: root,
  };
  const outputs = new Map([
    ["apps/docs/src/generated/rain-catalog.json", `${JSON.stringify(catalog, null, 2)}\n`],
    ["docs/rain/ai/components.md", renderIndex(catalog)],
  ]);

  for (const [file, content] of outputs) {
    if (process.argv.includes("--check")) {
      if (read(file) !== content) throw new Error(`目录已过期：${file}；运行 pnpm local:catalog。`);
    } else {
      mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
      writeFileSync(path.join(root, file), content);
    }
  }
  console.log(
    `组件目录${process.argv.includes("--check") ? "核对通过" : "已生成"}：${catalog.entries.length} 个源码模块。`,
  );
}

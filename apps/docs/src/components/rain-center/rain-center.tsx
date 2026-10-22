"use client";

import {
  Button,
  Card,
  Chip,
  Description,
  Disclosure,
  Input,
  Label,
  Link,
  ListBox,
  Select,
  Separator,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import {useTheme} from "next-themes";
import {useRef, useState} from "react";

import {env} from "~env";

import {useRainTheme} from "@/components/rain-theme-provider";
import catalog from "@/generated/rain-catalog.json";
import {useIsMounted} from "@/hooks/use-is-mounted";

import {rainCenterStyles} from "./rain-center.styles";

const styles = rainCenterStyles();

type Entry = (typeof catalog.entries)[number];
type Locale = "cn" | "en";
const storybookBase = env.NEXT_PUBLIC_RAIN_STORYBOOK_URL.replace(/\/$/, "");
const upstreamBase = `https://github.com/heroui-inc/heroui/blob/${catalog.commit}/`;
const copy = {
  cn: {
    accepted: "批改页已审核",
    ai: "交给 AI 继续设计",
    aiDescription: "先定位同版本 API、源码和示例，再组合或改造。",
    aiLink: "查看 AI 使用规则",
    all: "全部分类",
    category: "组件分类",
    center: "雨课堂组件中心",
    changeToOriginal: "对照 HeroUI 原版",
    changeToRain: "切换雨课堂主题",
    copied: "已复制，可粘贴到 AI 对话中。",
    copy: "复制 AI 上下文",
    css: "样式",
    details: "源码与 AI 上下文",
    directory: "全库目录",
    docs: "文档与示例",
    empty: "没有匹配的组件",
    emptyHint: "试试中文名称、英文名称或子组件名称。",
    english: "英文资料",
    example: "业务组合",
    exampleDescription: "列表、作答卡片、评分表单与确认浮层，共用一份示例源码。",
    exampleTitle: "课堂练习批改",
    examples: "示例源码",
    failed: "复制未完成，请在下方选取完整上下文并手动复制。",
    helper: "内部辅助",
    manualCopy: "手动复制 AI 上下文",
    modules: "个源码模块",
    noDescription: "组合部件或辅助模块，展开查看源码与可用资料。",
    note: "目录覆盖组件、组合部件和辅助模块；预览入口表示资料可达，审核状态按具体页面记录。",
    openExample: "打开批改示例",
    original: "HeroUI 原版",
    parts: "组合部件",
    placeholder: "例如：输入框、卡片、Modal、ListBox.Item",
    publicModules: "个根导出模块",
    rain: "雨课堂 · 浅色",
    relatedDocs: "组合用法",
    relatedStory: "组合预览",
    reset: "清除筛选",
    search: "搜索组件",
    source: "本地源码",
    story: "状态预览",
    theme: "当前主题",
    themeDescription: "颜色、字体与圆角集中维护，页面沿用原版组件组合。",
    upstream: "固定版本上游源码",
  },
  en: {
    accepted: "Grading page reviewed",
    ai: "Continue with AI",
    aiDescription: "Locate the pinned API, source and examples before composing or editing.",
    aiLink: "Read AI usage rules",
    all: "All categories",
    category: "Category",
    center: "Rain Classroom component center",
    changeToOriginal: "Compare HeroUI original",
    changeToRain: "Use Rain Classroom theme",
    copied: "Copied. Paste into your AI conversation.",
    copy: "Copy AI context",
    css: "Styles",
    details: "Source and AI context",
    directory: "Library directory",
    docs: "Docs and examples",
    empty: "No matching components",
    emptyHint: "Try an English name, Chinese name or compound part name.",
    english: "English content",
    example: "Business composition",
    exampleDescription:
      "Student list, answer cards, scoring form and confirmation dialog from one shared example.",
    exampleTitle: "Classroom grading",
    examples: "Example source",
    failed: "Copy was unavailable. Select the complete context below and copy it manually.",
    helper: "Internal helper",
    manualCopy: "AI context for manual copying",
    modules: "source modules",
    noDescription:
      "A compound part or support module. Expand to locate source and available references.",
    note: "This directory includes components, compound parts and support modules. Links describe availability; reviews are recorded per page.",
    openExample: "Open grading example",
    original: "HeroUI original",
    parts: "Compound parts",
    placeholder: "Try card, input, 模态框 or ListBox.Item",
    publicModules: "root export modules",
    rain: "Rain Classroom · Light",
    relatedDocs: "Composition usage",
    relatedStory: "Composition preview",
    reset: "Clear filters",
    search: "Search components",
    source: "Local source",
    story: "State preview",
    theme: "Current theme",
    themeDescription: "Shared colors, font families and radii with original HeroUI components.",
    upstream: "Pinned upstream source",
  },
};

function aiContext(entry: Entry, locale: Locale) {
  const cn = locale === "cn";
  const doc = entry.docs[locale];
  const related = cn ? "（组合引用）" : " (composition reference)";

  return [
    cn
      ? `使用本地雨课堂 HeroUI 库：HeroUI ${catalog.version}，固定提交 ${catalog.commit}。`
      : `Use the local Rain Classroom HeroUI library: HeroUI ${catalog.version}, pinned commit ${catalog.commit}.`,
    `${cn ? "项目根目录：" : "Project root: "}${catalog.workspaceRoot}`,
    cn
      ? "先读取 AGENTS.md、docs/rain/ai/index.md 与 docs/rain/ai/usage-rules.md。"
      : "Read AGENTS.md, docs/rain/ai/index.md and docs/rain/ai/usage-rules.md first.",
    `${cn ? "本次组件：" : "Component: "}${entry.name}`,
    entry.descriptions[locale]
      ? `${cn ? "使用说明：" : "Usage note: "}${entry.descriptions[locale]}`
      : "",
    entry.importName
      ? `${cn ? "公开导入：" : "Public import: "}import {${entry.importName}} from "@heroui/react";`
      : cn
        ? "先读取本地入口确认辅助导出与允许的导入路径。"
        : "Read the local entry to confirm support exports and permitted import paths.",
    `${cn ? "组件入口：" : "Entry: "}${entry.source}`,
    `${cn ? "组件实现：" : "Implementation: "}${entry.implementation}`,
    ...entry.styles.map((file) => `${cn ? "样式：" : "Styles: "}${file}`),
    entry.parts.length
      ? `${cn ? "可用组合部件：" : "Compound parts: "}${entry.parts.join(", ")}`
      : "",
    doc
      ? `${cn ? "文档：" : "Docs: "}${doc.file}${doc.related ? related : ""}${doc.language !== locale ? (cn ? "（英文资料）" : " (Chinese content)") : ""}`
      : "",
    ...entry.examples[locale].map((example) => `${cn ? "示例：" : "Example: "}${example.source}`),
    entry.story
      ? `Story: ${entry.story.file} → ${entry.story.id}${entry.story.related ? related : ""}`
      : "",
    cn
      ? "主题唯一入口：packages/rain-theme/index.css；页面不硬编码品牌色、字体或圆角。"
      : "Single theme entry: packages/rain-theme/index.css. Do not hardcode brand colors, fonts or radii in pages.",
    cn
      ? "优先在业务层组合，保持基础组件的键盘、焦点、错误与禁用机制。"
      : "Prefer business compositions and preserve primitive keyboard, focus, error and disabled behavior.",
    cn
      ? "课堂练习批改页已审核，改造时保留其已确认行为；本轮暂不运行新重测试。"
      : "The classroom grading page is reviewed; preserve its approved behavior. Do not start new heavy tests for this task.",
    cn
      ? "请先根据以上资料确认 API，再处理我随后描述的业务需求。"
      : "Confirm the API from these sources before addressing my following business request.",
  ]
    .filter(Boolean)
    .join("\n");
}
export function RainCenter({locale = "cn"}: {locale?: Locale}) {
  const t = copy[locale];
  const {isRainTheme, setRainTheme} = useRainTheme();
  const {resolvedTheme} = useTheme();
  const isMounted = useIsMounted();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [notice, setNotice] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFallback, setCopyFallback] = useState<{id: string; text: string} | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const copyRequest = useRef(0);
  const prefix = locale === "cn" ? "/cn" : "";
  const groups = [...new Set(catalog.entries.map((entry) => entry.group))].sort();
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const entries = catalog.entries.filter((entry) => {
    const searchable = [
      entry.id,
      entry.name,
      entry.titles.cn,
      entry.titles.en,
      entry.descriptions.cn,
      entry.descriptions.en,
      ...entry.exports,
      ...entry.parts,
      entry.groupLabel.cn,
      entry.groupLabel.en,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      (group === "all" || entry.group === group) && words.every((word) => searchable.includes(word))
    );
  });
  const previewHref = (storyId: string) =>
    `${storybookBase}/?${new URLSearchParams({
      globals: `heroui-theme:${isRainTheme ? "rain-light" : isMounted && resolvedTheme === "dark" ? "dark" : "light"}`,
      path: `/story/${storyId}`,
    })}`;
  const sourceHref = (file: string) =>
    upstreamBase + file.split("/").map(encodeURIComponent).join("/");

  function clearCopyFeedback() {
    copyRequest.current += 1;
    setCopiedId(null);
    setNotice("");
    setCopyFallback(null);
  }
  async function copyContext(entry: Entry) {
    const text = aiContext(entry, locale);

    clearCopyFeedback();
    const request = copyRequest.current;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      if (request !== copyRequest.current) return;
      setCopiedId(entry.id);
      setNotice(`${entry.name} · ${t.copied}`);
    } catch {
      if (request !== copyRequest.current) return;
      setCopyFallback({id: entry.id, text});
      setNotice(t.failed);
    } finally {
      setIsCopying(false);
    }
  }
  function reset() {
    setQuery("");
    setGroup("all");
    clearCopyFeedback();
  }

  return (
    <section aria-label={t.center} className={styles.root()}>
      <div className={styles.overview()}>
        <Card className={styles.card()}>
          <Card.Header>
            <Card.Description>{t.theme}</Card.Description>
            <Card.Title>{isRainTheme ? t.rain : t.original}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className={styles.muted()}>{t.themeDescription}</p>
          </Card.Content>
          <Card.Footer>
            <Button variant="secondary" onPress={() => setRainTheme(!isRainTheme)}>
              {isRainTheme ? t.changeToOriginal : t.changeToRain}
            </Button>
          </Card.Footer>
        </Card>
        <Card className={styles.card()}>
          <Card.Header>
            <Card.Description>{t.example}</Card.Description>
            <Card.Title>{t.exampleTitle}</Card.Title>
          </Card.Header>
          <Card.Content className={styles.stack()}>
            <p className={styles.muted()}>{t.exampleDescription}</p>
            <Chip color="success" size="sm" variant="soft">
              {t.accepted}
            </Chip>
          </Card.Content>
          <Card.Footer>
            <Link href={`${prefix}/docs/react/examples/grading-panel`}>{t.openExample}</Link>
          </Card.Footer>
        </Card>
        <Card className={styles.card()}>
          <Card.Header>
            <Card.Title>{t.ai}</Card.Title>
          </Card.Header>
          <Card.Content>
            <p className={styles.muted()}>{t.aiDescription}</p>
          </Card.Content>
          <Card.Footer>
            <Link href={`${prefix}/docs/react/rain/ai`}>{t.aiLink}</Link>
          </Card.Footer>
        </Card>
      </div>
      <div className={styles.row()}>
        <Typography.Heading level={2}>{t.directory}</Typography.Heading>
        <Chip variant="soft">HeroUI {catalog.version}</Chip>
      </div>
      <div className={styles.filter()}>
        <TextField
          value={query}
          onChange={(value) => {
            setQuery(value);
            clearCopyFeedback();
          }}
        >
          <Label>{t.search}</Label>
          <Input placeholder={t.placeholder} />
        </TextField>
        <Select
          value={group}
          onChange={(value) => {
            setGroup(value ? String(value) : "all");
            clearCopyFeedback();
          }}
        >
          <Label>{t.category}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="all" textValue={t.all}>
                {t.all}
                <ListBox.ItemIndicator />
              </ListBox.Item>
              {groups.map((id) => {
                const label = catalog.entries.find((entry) => entry.group === id)!.groupLabel[
                  locale
                ];

                return (
                  <ListBox.Item key={id} id={id} textValue={label}>
                    {label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div className={styles.row()}>
        <p aria-live="polite" className={styles.muted()}>
          {entries.length} / {catalog.counts.sourceModules} {t.modules} ·{" "}
          {catalog.counts.publicModules} {t.publicModules}
        </p>
        {!!(query || group !== "all") && (
          <Button size="sm" variant="tertiary" onPress={reset}>
            {t.reset}
          </Button>
        )}
      </div>
      <p aria-live="polite" className={styles.notice()} role="status">
        {notice}
      </p>
      {entries.length === 0 ? (
        <Card>
          <Card.Content className={styles.empty()}>
            <Card.Title>{t.empty}</Card.Title>
            <Card.Description>{t.emptyHint}</Card.Description>
            <Button variant="secondary" onPress={reset}>
              {t.reset}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className={styles.grid()}>
          {entries.map((entry) => {
            const doc = entry.docs[locale];

            return (
              <Card key={entry.id} aria-label={entry.name} className={styles.card()}>
                <Card.Header>
                  <div className={styles.cardHeader()}>
                    <Card.Title>{entry.titles[locale]}</Card.Title>
                    <Chip size="sm" variant="soft">
                      {entry.public ? entry.groupLabel[locale] : t.helper}
                    </Chip>
                  </div>
                  <Card.Description className={styles.description()}>
                    {entry.descriptions[locale] || t.noDescription}
                  </Card.Description>
                </Card.Header>
                <Card.Content className={styles.stack()}>
                  <div className={styles.links()}>
                    {!!doc && (
                      <Link href={doc.href}>
                        {doc.related ? t.relatedDocs : t.docs}
                        {doc.language !== locale
                          ? ` (${doc.language === "en" ? t.english : "Chinese content"})`
                          : ""}
                      </Link>
                    )}
                    {!!entry.story && (
                      <Link href={previewHref(entry.story.id)} rel="noreferrer" target="_blank">
                        {entry.story.related ? t.relatedStory : t.story}
                      </Link>
                    )}
                  </div>
                  <Separator />
                  <Disclosure>
                    <Disclosure.Heading>
                      <Disclosure.Trigger>
                        {t.details}
                        <Disclosure.Indicator />
                      </Disclosure.Trigger>
                    </Disclosure.Heading>
                    <Disclosure.Content>
                      <Disclosure.Body className={styles.stack()}>
                        <div>
                          <p className={styles.muted()}>{t.source}</p>
                          <code className={styles.source()}>{entry.implementation}</code>
                        </div>
                        {entry.styles.map((file) => (
                          <div key={file}>
                            <p className={styles.muted()}>{t.css}</p>
                            <code className={styles.source()}>{file}</code>
                          </div>
                        ))}
                        {entry.parts.length > 0 && (
                          <p className={styles.part()}>
                            {t.parts} · {entry.parts.join(" / ")}
                          </p>
                        )}
                        {entry.examples[locale].length > 0 && (
                          <div className={styles.stack()}>
                            <p className={styles.muted()}>{t.examples}</p>
                            {entry.examples[locale].map((example) => (
                              <Link
                                key={example.id}
                                className={styles.source()}
                                href={sourceHref(example.source)}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {example.source}
                              </Link>
                            ))}
                          </div>
                        )}
                        <Link
                          href={sourceHref(entry.implementation)}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {t.upstream}
                        </Link>
                        <Button
                          isDisabled={isCopying}
                          size="sm"
                          variant="secondary"
                          onPress={() => copyContext(entry)}
                        >
                          {copiedId === entry.id ? (locale === "cn" ? "已复制" : "Copied") : t.copy}
                        </Button>
                        {copyFallback?.id === entry.id && (
                          <TextField isReadOnly value={copyFallback.text}>
                            <Label>{t.manualCopy}</Label>
                            <TextArea rows={8} onFocus={(event) => event.currentTarget.select()} />
                            <Description>{t.failed}</Description>
                          </TextField>
                        )}
                      </Disclosure.Body>
                    </Disclosure.Content>
                  </Disclosure>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
      <p className={styles.muted()}>{t.note}</p>
    </section>
  );
}

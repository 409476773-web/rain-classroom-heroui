import assert from "node:assert/strict";
import {test} from "node:test";

import {createCatalog} from "./catalog.mjs";

function fixture() {
  const module = (id, extra = {}) => ({
    compound: [],
    demos: {en: [], zh: []},
    docs: {en: [], zh: []},
    exports: [{kind: "value", name: id === "card" ? "Card" : "Helper"}],
    id,
    kind: "component-or-part",
    parentStoryIds: [],
    referencedByStories: [],
    rootExported: true,
    source: {entry: `packages/react/src/components/${id}/index.ts`, files: []},
    stories: [],
    storyIds: [],
    styles: {css: []},
    ...extra,
  });

  return {
    demos: [],
    documents: [],
    modules: [module("card"), module("helper", {rootExported: false})],
    stories: [],
    summary: {publicComponentBarrelModules: 1, staticStoryExports: 2},
    upstream: {commit: "fixed-sha", inputSha256: "inputs", packageVersion: "3.2.6"},
  };
}
test("keeps every source module while avoiding invalid root import advice for helpers", () => {
  const catalog = createCatalog(fixture());

  assert.equal(catalog.entries.length, 2);
  assert.equal(catalog.entries.find(({id}) => id === "card").importName, "Card");
  assert.equal(catalog.entries.find(({id}) => id === "helper").importName, null);
  assert.equal(catalog.version, "3.2.6");
  assert.equal(catalog.commit, "fixed-sha");
});
test("keeps support modules distinct from the component names they re-export", () => {
  const input = fixture();

  input.modules[0].kind = "public-support-module";
  input.modules[0].id = "rac";
  input.modules[0].exports = [{kind: "value", name: "Virtualizer"}];
  const entry = createCatalog(input).entries.find(({id}) => id === "rac");

  assert.equal(entry.name, "rac");
  assert.equal(entry.importName, null);
  assert.equal(entry.group, "supporting");
});
test("marks English fallback honestly and strips the explicit English route prefix", () => {
  const input = fixture();

  input.documents.push({
    demoIds: [],
    file: "en-card",
    id: "en-card",
    kind: "component",
    locale: "en",
    owner: "card",
    route: "/en/docs/react/components/card",
    title: "Card",
  });
  input.modules[0].docs.en.push("en-card");
  const entry = createCatalog(input).entries[0];

  assert.equal(entry.docs.cn.href, "/docs/react/components/card");
  assert.equal(entry.docs.cn.language, "en");
  assert.equal(entry.docs.cn.related, false);
});
test("uses an actual composition story for a shared part without inventing a story ID", () => {
  const input = fixture();

  input.modules[0].referencedByStories.push({file: "composition.stories.tsx"});
  input.stories.push({
    actualStoryIds: ["components-forms-input--default"],
    file: "composition.stories.tsx",
    title: "Components/Forms/Input",
  });
  const entry = createCatalog(input).entries[0];

  assert.equal(entry.story.id, "components-forms-input--default");
  assert.equal(entry.story.related, true);
  assert.equal(entry.story.file, "composition.stories.tsx");
});
test("only links examples from the chosen document and preserves their actual source paths", () => {
  const input = fixture();

  input.documents.push({
    demoIds: ["card-basic"],
    file: "cn-card",
    id: "cn-card",
    kind: "component",
    locale: "zh",
    owner: "card",
    route: "/cn/docs/react/components/card",
    title: "Card 卡片",
  });
  input.modules[0].docs.zh.push("cn-card");
  input.demos.push(
    {
      id: "zh:card-basic",
      locale: "zh",
      owner: "card",
      registryKey: "card-basic",
      sourcePath: "basic.tsx",
    },
    {
      id: "zh:card-unused",
      locale: "zh",
      owner: "card",
      registryKey: "card-unused",
      sourcePath: "unused.tsx",
    },
  );
  const entry = createCatalog(input).entries[0];

  assert.deepEqual(
    entry.examples.cn.map(({id, source}) => ({id, source})),
    [{id: "card-basic", source: "basic.tsx"}],
  );
});
test("only offers examples that use the related module before limiting the selection", () => {
  const input = fixture();
  const file = "cn-collection";
  const demoIds = [
    "collection-basic",
    "collection-controlled",
    "collection-disabled",
    "collection-card-basic",
    "collection-card-controlled",
    "collection-card-disabled",
    "collection-card-compact",
  ];

  input.documents.push({
    demoIds,
    file,
    kind: "component",
    locale: "zh",
    owner: "collection",
    route: "/cn/docs/react/components/collection",
    title: "Collection",
  });
  input.demos.push(
    ...demoIds.map((id) => ({
      id: `zh:${id}`,
      locale: "zh",
      referencedByDocs: [file],
      references: [{module: id.includes("-card-") ? "card" : "collection"}],
      sourcePath: `${id}.tsx`,
    })),
  );
  const entry = createCatalog(input).entries.find(({id}) => id === "card");

  assert.equal(entry.docs.cn.related, true);
  assert.deepEqual(
    entry.examples.cn.map(({id}) => id),
    ["collection-card-basic", "collection-card-controlled", "collection-card-disabled"],
  );
});

function localReviewFixture(id = "menu") {
  const input = fixture();
  const isCalendar = id === "calendar-year-picker";
  const file = `packages/storybook/.storybook/stories/rain-state-review-${isCalendar ? "calendar" : "menu"}.stories.tsx`;

  Object.assign(input.modules[0], {
    exports: [{kind: "value", name: isCalendar ? "CalendarYearPicker" : "Menu"}],
    id,
    referencedByStories: [{file: "legacy.stories.tsx"}],
  });
  input.stories.push(
    {
      actualStoryIds: ["legacy--default"],
      file: "legacy.stories.tsx",
      title: "Components/Date and Time/Calendar",
    },
    {
      actualStoryIds: [],
      exportNames: [isCalendar ? "CalendarNavigation" : "Menu"],
      file,
      references: [{module: isCalendar ? "calendar" : "menu"}],
      title: "Components/Theme/State Review",
    },
  );

  return input;
}

test("prefers the explicit local Menu review without changing the built inventory", () => {
  const input = localReviewFixture();
  const before = JSON.stringify(input);
  const entry = createCatalog(input).entries.find(({id}) => id === "menu");

  assert.equal(entry.story.id, "components-theme-state-review--menu");
  assert.equal(entry.story.related, false);
  assert.equal(entry.story.localReview, true);
  assert.equal(entry.group, "collections");
  assert.match(entry.titles.cn, /菜单/);
  assert.equal(JSON.stringify(input), before);
});

test("links the in-progress year picker to the local calendar composition", () => {
  const entry = createCatalog(localReviewFixture("calendar-year-picker")).entries.find(
    ({id}) => id === "calendar-year-picker",
  );

  assert.equal(entry.story.id, "components-theme-state-review--calendar-navigation");
  assert.equal(entry.story.related, true);
  assert.equal(entry.group, "date-and-time");
  assert.match(entry.titles.cn, /进行中/);
  assert.match(entry.descriptions.cn, /尚未.*验收/);
});

for (const invalid of ["file", "export", "reference"]) {
  test(`rejects a local preview with missing ${invalid} evidence`, () => {
    const input = localReviewFixture();
    const review = input.stories[1];

    if (invalid === "file") input.stories.pop();
    if (invalid === "export") review.exportNames = ["AnotherStory"];
    if (invalid === "reference") review.references = [{module: "dropdown"}];

    assert.throws(() => createCatalog(input), /本地复查.*menu/);
  });
}

test("adds the ErrorMessage review while retaining its own docs and localized title", () => {
  const input = fixture();
  const file = "packages/storybook/.storybook/stories/rain-state-review-overlays.stories.tsx";

  Object.assign(input.modules[0], {
    docs: {en: [], zh: ["cn-error-message"]},
    exports: [{kind: "value", name: "ErrorMessage"}],
    id: "error-message",
  });
  input.documents.push({
    demoIds: [],
    file: "cn-error-message",
    kind: "component",
    locale: "zh",
    owner: "error-message",
    route: "/cn/docs/react/components/error-message",
    title: "ErrorMessage 错误消息",
  });
  input.stories.push({
    actualStoryIds: [],
    exportNames: ["Overlays", "ErrorMessages"],
    file,
    references: [{module: "error-message"}],
    title: "Components/Theme/State Review",
  });
  const entry = createCatalog(input).entries.find(({id}) => id === "error-message");

  assert.equal(entry.story?.id, "components-theme-state-review--error-messages");
  assert.equal(entry.story.localReview, true);
  assert.equal(entry.story.related, false);
  assert.equal(entry.titles.cn, "ErrorMessage 错误消息");
  assert.equal(entry.docs.cn.file, "cn-error-message");
});

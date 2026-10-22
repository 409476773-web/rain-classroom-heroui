"use client";

import type {Key, Selection} from "@heroui/react";
import type {Meta, StoryObj} from "@storybook/react";

import {Button, Card, Checkbox, Table, Tabs, Typography} from "@heroui/react";
import React, {useState} from "react";

import {rainLayoutReviewStyles} from "./rain-state-review-layouts.styles";
import {rainStateReviewStyles} from "./rain-state-review.styles";

const layout = rainLayoutReviewStyles();
const styles = rainStateReviewStyles();
const rows = [
  {
    answer: "从校园食堂的排队现象出发，解释高峰时段窗口供给与同学选择之间的关系。",
    feedback: "观点清楚，可继续补充观察时间和可比较的数据。",
    id: "s01",
    name: "林同学（虚构）",
  },
  {
    answer: "比较两个窗口在不同时间段的出餐数量，提出通过预点餐减少现场等待的方案。",
    feedback: "需要区分等待时间、取餐时间与窗口实际处理能力。",
    id: "s02",
    name: "陈同学（虚构）",
  },
  {
    answer: "这条固定作答仅用于观察禁用行的文字、透明度和焦点跳过情况。",
    feedback: "禁用样本，不参与本页选择。",
    id: "s03",
    name: "周同学（禁用）",
  },
  {
    answer: "建议对比试行方案前后一周同一时段的平均等待时间，同时记录用餐人数的变化。",
    feedback: "对照条件较完整，可补充样本量与异常情况说明。",
    id: "s04",
    name: "许同学（虚构）",
  },
];
const disabledRows = ["s03"];
const tabItems = [
  {
    content: "作答列表与批改进度均为固定示例。观察长中文标题、换行后的正文和切换时的键盘焦点。",
    id: "responses",
    isDisabled: false,
    title: "课堂练习作答与逐题批改记录",
  },
  {
    content:
      "将知识点、观察证据与学习反馈放在同一阅读区域，检查窄容器中的中文内容是否仍能完整阅读。",
    id: "analysis",
    isDisabled: false,
    title: "按知识点汇总的学习情况与反馈",
  },
  {
    content: "此面板属于禁用标签，不应通过点击或键盘选择进入。",
    id: "archived",
    isDisabled: true,
    title: "已归档练习与历史成绩（禁用）",
  },
  {
    content: "只在当前页面切换面板，不请求数据、不发送消息。可回到第一项继续检查焦点和选中状态。",
    id: "questions",
    isDisabled: false,
    title: "需要优先关注的疑难问题整理",
  },
];

function TableSample({label, variant}: {label: string; variant: "primary" | "secondary"}) {
  const [selected, setSelected] = useState<Selection>(new Set(["s01"]));
  const names = rows
    .filter((row) => !disabledRows.includes(row.id) && (selected === "all" || selected.has(row.id)))
    .map((row) => row.name);

  return (
    <div className={styles.stack()}>
      <Table variant={variant}>
        <Table.ScrollContainer>
          <Table.Content
            aria-label={label}
            className={layout.table()}
            disabledBehavior="all"
            disabledKeys={disabledRows}
            selectedKeys={selected}
            selectionMode="multiple"
            onSelectionChange={setSelected}
          >
            <Table.Header>
              <Table.Column aria-label="选择作答" id="selection">
                <Checkbox aria-label={`${label}：全选可用作答`} slot="selection">
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox.Content>
                </Checkbox>
              </Table.Column>
              <Table.Column isRowHeader id="student">
                学生示例
              </Table.Column>
              <Table.Column id="answer">长中文作答片段</Table.Column>
              <Table.Column id="feedback">待确认的反馈内容</Table.Column>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => (
                <Table.Row key={row.id} id={row.id} textValue={row.name}>
                  <Table.Cell>
                    <Checkbox aria-label={`选择${row.name}`} slot="selection">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Content>
                    </Checkbox>
                  </Table.Cell>
                  <Table.Cell>{row.name}</Table.Cell>
                  <Table.Cell>{row.answer}</Table.Cell>
                  <Table.Cell>{row.feedback}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <p aria-live="polite" className={styles.note()}>
        {label}已选：{names.length ? names.join("、") : "未选择"}。仅保留本页选择。
      </p>
    </div>
  );
}

TableSample.displayName = "HeroUI.StateReview.TableSample";

function TabsSample({label, variant}: {label: string; variant: "primary" | "secondary"}) {
  const [selected, setSelected] = useState<Key>("responses");

  return (
    <div className={styles.stack()}>
      <Tabs selectedKey={selected} variant={variant} onSelectionChange={setSelected}>
        <Tabs.ListContainer>
          <Tabs.List aria-label={label}>
            {tabItems.map((item) => (
              <Tabs.Tab key={item.id} id={item.id} isDisabled={item.isDisabled}>
                {item.title}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {tabItems.map((item) => (
          <Tabs.Panel key={item.id} id={item.id}>
            <Typography.Paragraph>{item.content}</Typography.Paragraph>
          </Tabs.Panel>
        ))}
      </Tabs>
      <p aria-live="polite" className={styles.note()}>
        当前标签：{tabItems.find((item) => item.id === selected)?.title}
      </p>
    </div>
  );
}

TabsSample.displayName = "HeroUI.StateReview.TabsSample";

function CardSample({label, variant}: {label: string; variant: "default" | "secondary"}) {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.stack()}>
      <Card aria-label={label} role="article" variant={variant}>
        <Card.Header>
          <Card.Title>
            从真实观察到可以检验的改进方案：一份包含长中文标题与完整反馈内容的课堂练习示例
          </Card.Title>
          <Card.Description>
            固定虚构内容，用于检查标题、描述、正文和操作区在不同宽度下的阅读与换行。
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <Typography.Paragraph>
            建议先说明观察到的现象，再提出可以验证的解释。记录同一时段的到达人数、出餐数量与平均等待时间，
            并在方案试行前后保留一致的对照条件。这里的正文不会被省略，按钮只更新当前页的动作次数。
          </Typography.Paragraph>
        </Card.Content>
        <Card.Footer>
          <div className={styles.row()}>
            <Button type="button" onPress={() => setCount((previous) => previous + 1)}>
              记录一次页内操作
            </Button>
            <Button type="button" variant="secondary" onPress={() => setCount(0)}>
              重置次数
            </Button>
            <Button isDisabled type="button" variant="secondary">
              禁用的内部按钮
            </Button>
          </div>
        </Card.Footer>
      </Card>
      <p aria-live="polite" className={styles.note()}>
        {label}动作次数：{count}。状态属于内部按钮，Card 不增加悬停、禁用或错误状态。
      </p>
    </div>
  );
}

CardSample.displayName = "HeroUI.StateReview.CardSample";

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "固定虚构数据的表格、标签页与卡片视觉复查。宽容器及固定 320px 窄容器使用原版公开组件，选择和按钮反馈仅留在本页；不硬编码品牌视觉。",
      },
    },
    layout: "fullscreen",
  },
  title: "Components/Theme/State Review",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Layouts: Story = {
  name: "表格、标签页与卡片",
  render: () => (
    <main aria-label="表格、标签页与卡片状态检查" className={styles.root()}>
      <header className={styles.stack()}>
        <Typography.Heading level={1}>表格、标签页与卡片</Typography.Heading>
        <p className={styles.note()}>
          使用顶部主题菜单进行对照。每类提供宽容器与固定 320px 窄容器，无需改变浏览器视口；
          窄表格通过原版滚动容器横向查看完整列，标签页沿用原版滚动与方向键行为。
        </p>
      </header>

      <section aria-labelledby="layout-tables-heading" className={styles.stack()}>
        <Typography.Heading id="layout-tables-heading" level={2}>
          表格：长中文、行选择与禁用行
        </Typography.Heading>
        <p className={styles.note()}>
          使用 Tab、方向键和空格检查焦点与行选择。第三行禁用，不参与选择；初始选中第一行。
        </p>
        <div className={layout.wide()}>
          <p className={styles.note()}>宽容器 · primary</p>
          <TableSample label="宽容器表格" variant="primary" />
        </div>
        <div className={layout.narrow()}>
          <p className={styles.note()}>固定窄容器 · 320px · secondary</p>
          <TableSample label="窄容器表格" variant="secondary" />
        </div>
      </section>

      <section aria-labelledby="layout-tabs-heading" className={styles.stack()}>
        <Typography.Heading id="layout-tabs-heading" level={2}>
          标签页：长标题、选中与禁用
        </Typography.Heading>
        <p className={styles.note()}>
          雨课堂标签名只显示一行，过长时省略，悬停省略文字可查看全名。使用方向键移动；
          “已归档练习与历史成绩”保持禁用，窄容器保留原版溢出导航。
        </p>
        <div className={layout.wide()}>
          <p className={styles.note()}>宽容器 · primary</p>
          <TabsSample label="宽容器练习标签" variant="primary" />
        </div>
        <div className={layout.narrow()}>
          <p className={styles.note()}>固定窄容器 · 320px · secondary</p>
          <TabsSample label="窄容器练习标签" variant="secondary" />
        </div>
      </section>

      <section aria-labelledby="layout-cards-heading" className={styles.stack()}>
        <Typography.Heading id="layout-cards-heading" level={2}>
          卡片：长标题、正文与内部按钮
        </Typography.Heading>
        <p className={styles.note()}>
          仅观察卡片承载的中文与操作布局；焦点、悬停和禁用由原版内部按钮表达。
        </p>
        <div className={layout.wide()}>
          <p className={styles.note()}>宽容器 · default</p>
          <CardSample label="宽容器卡片" variant="default" />
        </div>
        <div className={layout.narrow()}>
          <p className={styles.note()}>固定窄容器 · 320px · secondary</p>
          <CardSample label="窄容器卡片" variant="secondary" />
        </div>
      </section>
    </main>
  ),
};
